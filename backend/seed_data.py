import datetime
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
from models import (
    User, PatientProfile, EmergencyIdentity, Hospital,
    EmergencyIncident, MedicalDocument, CareCircleMember, AuditLog, SuspiciousAccessAlert
)
from services.audit_chain import create_audit_entry, GENESIS_HASH, calculate_block_hash

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # 1. Primary Demo Patient
        user = User(
            full_name="Rahul Sharma",
            email="rahul.sharma@emergencycare.org",
            role="PATIENT",
            phone="+91 98230 41122"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        profile = PatientProfile(
            user_id=user.id,
            emergency_id="EMG-8942-X",
            blood_group="B+",
            date_of_birth="1992-04-14",
            gender="Male",
            primary_language="English",
            organ_donor=True,
            critical_allergies="Penicillin, Sulfa Drugs",
            critical_conditions="Bronchial Asthma, Type 2 Diabetes",
            active_medications="Asthalin Inhaler (100mcg PRN), Metformin (500mg daily), Aspirin (75mg daily)",
            emergency_instructions="Severe Penicillin allergy! Do not administer beta-lactam antibiotics. Keep airway clear.",
            past_surgeries="Appendectomy (2018), Arthroscopic Knee Surgery (2021)",
            recent_reports="Cardiology Consultation Report (Aug 2026), Complete Blood Count (July 2026)"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

        # 2. Emergency Identity (QR & NFC)
        identity = EmergencyIdentity(
            patient_id=profile.id,
            emergency_id="EMG-8942-X",
            qr_break_glass_token="BG-TOKEN-8942-ALPHA-KEY",
            nfc_payload="https://emergencycare.app/break-glass/BG-TOKEN-8942-ALPHA-KEY",
            printable_card_code="CARD-EMG-8942",
            lockscreen_badge_url="https://emergencycare.app/badge/EMG-8942-X",
            is_active=True
        )
        db.add(identity)

        # 3. Hospitals
        hospitals = [
            Hospital(
                name="Apex Level-1 Trauma & Emergency Center",
                address="Plot 42, Senapati Bapat Road, Pune",
                latitude=18.5308,
                longitude=73.8315,
                phone="+91 20 6601 9000",
                trauma_capability=True,
                cardiac_capability=True,
                burn_unit=True,
                icu_beds_available=6,
                total_beds=150,
                er_status="OPEN"
            ),
            Hospital(
                name="City General Hospital & Urgent Care",
                address="12 FC Road, Shivajinagar, Pune",
                latitude=18.5204,
                longitude=73.8567,
                phone="+91 20 2553 4000",
                trauma_capability=False,
                cardiac_capability=True,
                burn_unit=False,
                icu_beds_available=2,
                total_beds=80,
                er_status="BUSY"
            ),
            Hospital(
                name="CareMax Cardiac & Super Speciality",
                address="Bund Garden Road, Camp, Pune",
                latitude=18.5362,
                longitude=73.8789,
                phone="+91 20 4000 8800",
                trauma_capability=True,
                cardiac_capability=True,
                burn_unit=False,
                icu_beds_available=8,
                total_beds=200,
                er_status="OPEN"
            )
        ]
        for h in hospitals:
            db.add(h)
        db.commit()

        # 4. Care Circle Members
        care_members = [
            CareCircleMember(
                patient_id=profile.id,
                name="Priya Sharma",
                relationship="Spouse",
                phone="+91 98230 99887",
                permission_tier="FULL",
                notify_on_break_glass=True
            ),
            CareCircleMember(
                patient_id=profile.id,
                name="Amit Sharma",
                relationship="Brother",
                phone="+91 98230 44332",
                permission_tier="EMERGENCY_NOTIFY",
                notify_on_break_glass=True
            )
        ]
        for cm in care_members:
            db.add(cm)

        # 5. Medical Documents
        docs = [
            MedicalDocument(
                patient_id=profile.id,
                title="Pulmonology Consultation & Spirometry Report",
                doc_type="Discharge Summary",
                ocr_raw_text="Patient Rahul Sharma, Age 34. Diagnosis: Moderate Persistent Asthma. Spirometry FEV1/FVC: 72%. Rx: Asthalin Inhaler PRN.",
                confidence_score=0.97,
                verification_status="VERIFIED"
            ),
            MedicalDocument(
                patient_id=profile.id,
                title="Complete Blood Count & Allergy Screening",
                doc_type="Lab Report",
                ocr_raw_text="IgE Panel: High Sensitivity to Penicillin G & Ampicillin. Hemoglobin: 14.2 g/dL. WBC: 7,400 /mcL.",
                confidence_score=0.99,
                verification_status="VERIFIED"
            )
        ]
        for d in docs:
            db.add(d)

        # 6. Active Initial Emergency Incident
        now = datetime.datetime.utcnow()
        incident = EmergencyIncident(
            incident_code="INC-2026-08-31-004281",
            patient_id=profile.id,
            status="CREATED",
            current_lat=18.5204,
            current_lng=73.8567,
            eta_minutes=7,
            location_timeline='[{"time": "17:02 UTC", "status": "Emergency Activated", "lat": 18.5204, "lng": 73.8567}]',
            created_at=now,
            updated_at=now
        )
        db.add(incident)
        db.commit()

        # 7. Seed Initial Cryptographic Audit Ledger
        create_audit_entry(
            db=db,
            user_name="System Initializer",
            user_role="SYSTEM",
            patient_id=profile.id,
            access_type="SYSTEM_GENESIS",
            access_reason="Initial Emergency Identity Provisioned & Verified"
        )
        create_audit_entry(
            db=db,
            user_name="Dr. Vikram Deshmukh",
            user_role="HOSPITAL_STAFF",
            patient_id=profile.id,
            access_type="DOCUMENT_VERIFICATION",
            access_reason="Verified Penicillin allergy document source"
        )

        # 8. Seed Suspicious Access Alert example
        suspicious = SuspiciousAccessAlert(
            user_name="Unverified Ambulance Terminal #4",
            role="PARAMEDIC",
            access_count=5,
            time_window_minutes=3,
            risk_level="HIGH",
            reason="Abnormally high query rate across multiple patient IDs without dispatch verification code."
        )
        db.add(suspicious)
        db.commit()

        print("Database successfully seeded with EmergencyCare initial demo data.")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
