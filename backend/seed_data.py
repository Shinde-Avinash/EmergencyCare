import datetime
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models
from auth_service import hash_password

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        now = datetime.datetime.utcnow()

        # 1. Seed Users
        user_patient = models.User(
            full_name="Rahul Sharma",
            email="rahul.sharma@emergencycare.org",
            password_hash=hash_password("password123"),
            role="PATIENT",
            phone="+91 98230 99887"
        )
        user_bystander = models.User(
            full_name="Aniket Deshmukh",
            email="bystander@emergencycare.org",
            password_hash=hash_password("password123"),
            role="BYSTANDER",
            phone="+91 98111 22334"
        )
        user_paramedic = models.User(
            full_name="Officer R. Patil",
            email="officer.patil@ambulance.org",
            password_hash=hash_password("password123"),
            role="PARAMEDIC",
            phone="+91 98765 43210"
        )
        user_doctor = models.User(
            full_name="Dr. Vikram Deshmukh",
            email="dr.deshmukh@traumaer.org",
            password_hash=hash_password("password123"),
            role="HOSPITAL_STAFF",
            phone="+91 98222 33445"
        )
        user_auditor = models.User(
            full_name="Admin Security Desk",
            email="auditor@emergencycare.org",
            password_hash=hash_password("password123"),
            role="ADMIN",
            phone="+91 98000 11111"
        )
        user_sys_admin = models.User(
            full_name="System Administrator",
            email="admin@emergencycare.org",
            password_hash=hash_password("password123"),
            role="ADMIN",
            phone="+91 98000 99999"
        )
        user_avi = models.User(
            full_name="Avi",
            email="avi@s.com",
            password_hash=hash_password("password123"),
            role="ADMIN",
            phone="+91 98888 77777"
        )
        db.add_all([user_patient, user_bystander, user_paramedic, user_doctor, user_auditor, user_sys_admin, user_avi])
        db.commit()

        # 2. Seed Patient Profile
        patient_profile = models.PatientProfile(
            user_id=user_patient.id,
            emergency_id="EMG-8942-X",
            blood_group="B+",
            date_of_birth="1992-04-14",
            gender="Male",
            primary_language="English",
            organ_donor=True,
            critical_allergies="Penicillin, Sulfa Drugs",
            critical_conditions="Bronchial Asthma, Type 2 Diabetes",
            active_medications="Asthalin Inhaler (100mcg), Metformin 500mg",
            emergency_instructions="Severe Penicillin allergy! Do not administer beta-lactam antibiotics. Keep airways clear under emergency anesthesia.",
            past_surgeries="Appendectomy (2018)",
            recent_reports="Cardiology Report (2026), Spirometry Test (2026)"
        )
        db.add(patient_profile)
        db.commit()

        # 3. Seed Emergency Identity Token
        emergency_identity = models.EmergencyIdentity(
            patient_id=patient_profile.id,
            emergency_id="EMG-8942-X",
            qr_break_glass_token="BG-TOKEN-8942-ALPHA-KEY",
            nfc_payload="https://emergencycare.app/break-glass/BG-TOKEN-8942-ALPHA-KEY",
            printable_card_code="CARD-EMG-8942",
            lockscreen_badge_url="https://emergencycare.app/badge/EMG-8942-X",
            is_active=True
        )
        db.add(emergency_identity)
        db.commit()

        # 4. Seed 8 Real-World Major Hospitals with Authentic Geographic Coordinates
        hospitals_data = [
            models.Hospital(
                name="Apex Level-1 Trauma Center",
                address="FC Road Sector 4, Pune (2.4 km away)",
                latitude=18.5308,
                longitude=73.8474,
                phone="+91 20 2567 8900",
                trauma_capability=True,
                cardiac_capability=True,
                burn_unit=True,
                icu_beds_available=4,
                total_beds=150,
                er_status="OPEN"
            ),
            models.Hospital(
                name="Sahyadri Super Specialty Hospital",
                address="Deccan Gymkhana, Pune (3.2 km away)",
                latitude=18.5165,
                longitude=73.8402,
                phone="+91 20 6726 0000",
                trauma_capability=True,
                cardiac_capability=True,
                burn_unit=False,
                icu_beds_available=3,
                total_beds=120,
                er_status="OPEN"
            ),
            models.Hospital(
                name="KEM Hospital & Research Centre",
                address="Rasta Peth, Pune (3.9 km away)",
                latitude=18.5228,
                longitude=73.8685,
                phone="+91 20 2621 7000",
                trauma_capability=True,
                cardiac_capability=True,
                burn_unit=True,
                icu_beds_available=5,
                total_beds=200,
                er_status="OPEN"
            ),
            models.Hospital(
                name="Ruby Hall ER Center",
                address="Bund Garden Road, Pune (4.1 km away)",
                latitude=18.5362,
                longitude=73.8778,
                phone="+91 20 6645 5100",
                trauma_capability=True,
                cardiac_capability=True,
                burn_unit=False,
                icu_beds_available=2,
                total_beds=180,
                er_status="OPEN"
            ),
            models.Hospital(
                name="Poona Hospital & Research Centre",
                address="Sadashiv Peth, Pune (3.0 km away)",
                latitude=18.5122,
                longitude=73.8465,
                phone="+91 20 6609 6000",
                trauma_capability=False,
                cardiac_capability=True,
                burn_unit=False,
                icu_beds_available=2,
                total_beds=90,
                er_status="OPEN"
            ),
            models.Hospital(
                name="Deenanath Mangeshkar Hospital",
                address="Erandwane, Pune (4.8 km away)",
                latitude=18.5042,
                longitude=73.8324,
                phone="+91 20 4015 1000",
                trauma_capability=True,
                cardiac_capability=True,
                burn_unit=True,
                icu_beds_available=6,
                total_beds=250,
                er_status="OPEN"
            ),
            models.Hospital(
                name="Jehangir Specialty Hospital",
                address="Near Railway Station, Pune (5.8 km away)",
                latitude=18.5292,
                longitude=73.8746,
                phone="+91 20 6681 9999",
                trauma_capability=False,
                cardiac_capability=True,
                burn_unit=True,
                icu_beds_available=1,
                total_beds=110,
                er_status="OPEN"
            ),
            models.Hospital(
                name="Noble Hospital & ER Center",
                address="Hadapsar, Pune (8.5 km away)",
                latitude=18.5085,
                longitude=73.9260,
                phone="+91 20 6628 5000",
                trauma_capability=True,
                cardiac_capability=True,
                burn_unit=False,
                icu_beds_available=3,
                total_beds=140,
                er_status="OPEN"
            )
        ]
        db.add_all(hospitals_data)
        db.commit()

        # 5. Seed Emergency Incident
        incident = models.EmergencyIncident(
            incident_code="INC-2026-08-31-004281",
            patient_id=patient_profile.id,
            status="CREATED",
            current_lat=18.5204,
            current_lng=73.8567,
            eta_minutes=6,
            assigned_hospital_id=hospitals_data[0].id,
            location_timeline='[{"time": "17:02 UTC", "status": "Emergency Activated", "lat": 18.5204, "lng": 73.8567}]',
            created_at=now
        )
        db.add(incident)
        db.commit()

        # 6. Seed Care Circle Members
        care_members = [
          models.CareCircleMember(
              patient_id=patient_profile.id,
              name="Priya Sharma",
              relationship="Spouse",
              phone="+91 98230 99887",
              permission_tier="FULL",
              notify_on_break_glass=True
          ),
          models.CareCircleMember(
              patient_id=patient_profile.id,
              name="Vikram Sharma",
              relationship="Brother",
              phone="+91 98100 44556",
              permission_tier="EMERGENCY_NOTIFY",
              notify_on_break_glass=True
          )
        ]
        db.add_all(care_members)
        db.commit()

        print("Database successfully seeded with 8 Real-World Major Hospitals!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
