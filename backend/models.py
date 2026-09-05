import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(128), nullable=True)
    role = Column(String(50), default="PATIENT") # PATIENT, BYSTANDER, PARAMEDIC, HOSPITAL_STAFF, ADMIN
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    profile = relationship("PatientProfile", back_populates="user", uselist=False)

class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    emergency_id = Column(String(50), unique=True, index=True) # e.g. EMG-8942-X
    blood_group = Column(String(10), nullable=False)
    date_of_birth = Column(String(20), nullable=False)
    gender = Column(String(20), nullable=False)
    primary_language = Column(String(20), default="English")
    organ_donor = Column(Boolean, default=True)

    # Severe/Critical
    critical_allergies = Column(Text, nullable=True) # JSON or comma string
    critical_conditions = Column(Text, nullable=True)
    active_medications = Column(Text, nullable=True)
    emergency_instructions = Column(Text, nullable=True)

    # Important/History
    past_surgeries = Column(Text, nullable=True)
    recent_reports = Column(Text, nullable=True)

    user = relationship("User", back_populates="profile")

class EmergencyIdentity(Base):
    __tablename__ = "emergency_identities"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"))
    emergency_id = Column(String(50), unique=True, index=True)
    qr_break_glass_token = Column(String(100), unique=True, index=True)
    nfc_payload = Column(String(255))
    printable_card_code = Column(String(50))
    lockscreen_badge_url = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class BreakGlassSession(Base):
    __tablename__ = "break_glass_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_token = Column(String(100), unique=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"))
    requester_name = Column(String(100), nullable=False)
    requester_role = Column(String(50), nullable=False) # BYSTANDER, PARAMEDIC, HOSPITAL_STAFF
    access_reason = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    device_info = Column(String(255), nullable=True)
    scoped_data_tier = Column(String(50), default="CRITICAL") # CRITICAL, IMPORTANT, FULL
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    biometric_verified = Column(Boolean, default=False)

class MedicalDocument(Base):
    __tablename__ = "medical_documents"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"))
    title = Column(String(150), nullable=False)
    doc_type = Column(String(50), nullable=False) # Prescription, Discharge Summary, Lab Report, X-Ray
    file_url = Column(String(255), nullable=True)
    ocr_raw_text = Column(Text, nullable=True)
    extracted_json = Column(Text, nullable=True) # Extracted fields
    confidence_score = Column(Float, default=0.95)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    verification_status = Column(String(20), default="VERIFIED")

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    phone = Column(String(30), nullable=False)
    trauma_capability = Column(Boolean, default=True)
    cardiac_capability = Column(Boolean, default=True)
    burn_unit = Column(Boolean, default=False)
    icu_beds_available = Column(Integer, default=5)
    total_beds = Column(Integer, default=100)
    ventilator_count = Column(Integer, default=3)
    blood_bank_status = Column(String(50), default="STOCKS_AVAILABLE")
    trauma_bed_capacity = Column(Integer, default=5)
    er_status = Column(String(20), default="OPEN") # OPEN, BUSY, FULL

class EmergencyIncident(Base):
    __tablename__ = "emergency_incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_code = Column(String(50), unique=True, index=True) # INC-2026-08-31-004281
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"))
    break_glass_session_id = Column(Integer, ForeignKey("break_glass_sessions.id"), nullable=True)
    assigned_hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    
    # State Machine: CREATED -> VERIFIED -> RESPONDER_ASSIGNED -> HOSPITAL_SELECTED -> HOSPITAL_NOTIFIED -> PATIENT_IN_TRANSIT -> HOSPITAL_RECEIVED -> CLOSED
    status = Column(String(50), default="CREATED")
    triage_tag = Column(String(20), default="GREEN") # RED, YELLOW, GREEN, BLACK
    news2_score = Column(Integer, nullable=True)
    
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    eta_minutes = Column(Integer, nullable=True)
    location_timeline = Column(Text, nullable=True) # JSON list of timestamps + locations
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class EmergencyHandoff(Base):
    __tablename__ = "emergency_handoffs"

    id = Column(Integer, primary_key=True, index=True)
    incident_code = Column(String(50), index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    patient_snapshot_summary = Column(Text, nullable=False)
    acknowledged = Column(Boolean, default=False)
    acknowledged_at = Column(DateTime, nullable=True)
    receiving_doctor_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    block_index = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    user_name = Column(String(100), nullable=False)
    user_role = Column(String(50), nullable=False)
    patient_id = Column(Integer, nullable=False)
    access_type = Column(String(50), nullable=False) # BREAK_GLASS_SCAN, HOSPITAL_HANDOFF, PROFILE_EDIT
    access_reason = Column(String(255), nullable=False)
    ip_address = Column(String(45), default="127.0.0.1")
    previous_hash = Column(String(64), nullable=False)
    current_hash = Column(String(64), nullable=False)

class SuspiciousAccessAlert(Base):
    __tablename__ = "suspicious_access_alerts"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    user_name = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False)
    access_count = Column(Integer, default=1)
    time_window_minutes = Column(Integer, default=5)
    risk_level = Column(String(20), default="HIGH") # HIGH, MEDIUM, LOW
    reason = Column(Text, nullable=False)

class CareCircleMember(Base):
    __tablename__ = "care_circle_members"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"))
    name = Column(String(100), nullable=False)
    relationship = Column(String(50), nullable=False) # Spouse, Parent, Child, Caregiver
    phone = Column(String(20), nullable=False)
    permission_tier = Column(String(50), default="EMERGENCY_NOTIFY") # FULL, EMERGENCY_NOTIFY, READ_ONLY
    notify_on_break_glass = Column(Boolean, default=True)

class RoleUpdateRequest(Base):
    __tablename__ = "role_update_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    user_name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    current_role = Column(String(50), nullable=False)
    requested_role = Column(String(50), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(20), default="PENDING") # PENDING, APPROVED, REJECTED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
