from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
import datetime

class AuthLoginRequest(BaseModel):
    email: str
    password: str

class AuthRegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    role: str = "PATIENT"
    phone: Optional[str] = None

class AdminPatientCreateRequest(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    blood_group: str = "B+"
    date_of_birth: Optional[str] = "1995-01-01"
    gender: Optional[str] = "Male"
    primary_language: Optional[str] = "English"
    organ_donor: bool = True
    critical_allergies: str = "None declared"
    critical_conditions: str = "None declared"
    active_medications: str = "None declared"
    emergency_instructions: str = "Standard resuscitation protocol."

class AdminPatientUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    blood_group: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    primary_language: Optional[str] = None
    organ_donor: Optional[bool] = None
    critical_allergies: Optional[str] = None
    critical_conditions: Optional[str] = None
    active_medications: Optional[str] = None
    emergency_instructions: Optional[str] = None

class RoleUpdateRequestSchema(BaseModel):
    user_id: Optional[int] = 1
    requested_role: str
    reason: str

class BreakGlassRequest(BaseModel):
    qr_token: str
    requester_name: str
    requester_role: str # BYSTANDER, PARAMEDIC, HOSPITAL_STAFF
    access_reason: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    device_info: Optional[str] = "Mobile Scanner Web Client v1.0"

class BreakGlassResponse(BaseModel):
    session_token: str
    patient_emergency_id: str
    patient_name: str
    blood_group: str
    critical_allergies: List[str]
    critical_conditions: List[str]
    active_medications: List[str]
    emergency_instructions: str
    emergency_contacts: List[dict]
    ai_emergency_summary: str
    scoped_tier: str
    expires_at: str

class IncidentCreateRequest(BaseModel):
    break_glass_session_token: Optional[str] = None
    patient_id: int = 1
    latitude: float = 18.5204
    longitude: float = 73.8567
    reason: str = "Roadside Emergency"

class IncidentStateUpdateRequest(BaseModel):
    incident_code: str
    next_status: str # CREATED, VERIFIED, RESPONDER_ASSIGNED, HOSPITAL_SELECTED, HOSPITAL_NOTIFIED, PATIENT_IN_TRANSIT, HOSPITAL_RECEIVED, CLOSED
    assigned_hospital_id: Optional[int] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    eta_minutes: Optional[int] = None

class HospitalRoutingRequest(BaseModel):
    patient_lat: float
    patient_lng: float
    required_specialty: Optional[str] = "TRAUMA" # TRAUMA, CARDIAC, BURN, GENERAL

class DocumentUploadSimulationRequest(BaseModel):
    title: str
    doc_type: str # Prescription, Discharge Summary, Lab Report, CT/MRI
    sample_content: str

class HandoffAcknowledgeRequest(BaseModel):
    incident_code: str
    receiving_doctor_notes: str = "Acknowledged by ER Triage team. Trauma Room 2 prepared."

class AuditVerifyResponse(BaseModel):
    is_valid: bool
    total_blocks: int
    verified_at: str
    details: str
