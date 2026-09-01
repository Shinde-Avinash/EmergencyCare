import datetime
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models
import schemas
from seed_data import seed_database
from services.break_glass import initiate_break_glass_session
from services.ai_engine import generate_ai_clinical_summary, process_medical_document_ocr
from services.hospital_routing import recommend_hospitals
from services.audit_chain import create_audit_entry, verify_audit_chain_integrity
from services.readiness import calculate_emergency_readiness
from services.normalization import normalize_medical_term

# Ensure database tables exist and seed if empty
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EmergencyCare API",
    description="Intelligent Emergency Response & Care Continuity Platform API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to ensure demo data exists
@app.on_event("startup")
def startup_event():
    db = next(get_db())
    try:
        user_count = db.query(models.User).count()
        if user_count == 0:
            seed_database()
    except Exception as e:
        print(f"Startup DB init note: {e}")

@app.get("/")
def root():
    return {
        "app": "EmergencyCare API Engine",
        "status": "RUNNING",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "EmergencyCare Engine",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

@app.post("/api/auth/register")
def register_user(req: schemas.AuthRegisterRequest, db: Session = Depends(get_db)):
    from auth_service import hash_password, create_access_token
    existing = db.query(models.User).filter(models.User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already registered")

    pwd_hash = hash_password(req.password)
    user = models.User(
        full_name=req.full_name,
        email=req.email,
        password_hash=pwd_hash,
        role=req.role.upper(),
        phone=req.phone
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Auto-provision Patient Emergency Profile & Identity
    emg_id = f"EMG-{abs(hash(user.email)) % 10000:04d}-X"
    profile = models.PatientProfile(
        user_id=user.id,
        emergency_id=emg_id,
        blood_group="B+",
        date_of_birth="1995-01-01",
        gender="Other",
        primary_language="English",
        organ_donor=True,
        critical_allergies="None declared",
        critical_conditions="None declared",
        active_medications="None declared",
        emergency_instructions="Standard resuscitation protocol."
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    identity = models.EmergencyIdentity(
        patient_id=profile.id,
        emergency_id=emg_id,
        qr_break_glass_token=f"BG-TOKEN-{emg_id}-KEY",
        nfc_payload=f"https://emergencycare.app/break-glass/BG-TOKEN-{emg_id}-KEY",
        printable_card_code=f"CARD-{emg_id}",
        lockscreen_badge_url=f"https://emergencycare.app/badge/{emg_id}",
        is_active=True
    )
    db.add(identity)
    db.commit()

    patient_id = profile.id
    token = create_access_token({"sub": user.email, "user_id": user.id, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "patient_id": patient_id
        }
    }

@app.post("/api/auth/login")
def login_user(req: schemas.AuthLoginRequest, db: Session = Depends(get_db)):
    from auth_service import verify_password, create_access_token
    user = db.query(models.User).filter(models.User.email == req.email).first()
    
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password. Access Denied.")
        
    profile = db.query(models.PatientProfile).filter(models.PatientProfile.user_id == user.id).first()
    patient_id = profile.id if profile else 1

    token = create_access_token({"sub": user.email, "user_id": user.id, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "patient_id": patient_id
        }
    }

# --- Module 1: Patient & Identity ---
@app.get("/api/patient/{patient_id}")
def get_patient_profile(patient_id: int = 1, db: Session = Depends(get_db)):
    profile = db.query(models.PatientProfile).filter(models.PatientProfile.id == patient_id).first()
    if not profile:
        # Fallback to first profile if specified ID not found
        profile = db.query(models.PatientProfile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    user = db.query(models.User).filter(models.User.id == profile.user_id).first()
    
    allergies = [a.strip() for a in (profile.critical_allergies or "").split(",") if a.strip()]
    conditions = [c.strip() for c in (profile.critical_conditions or "").split(",") if c.strip()]
    meds = [m.strip() for m in (profile.active_medications or "").split(",") if m.strip()]

    ai_data = generate_ai_clinical_summary({
        "critical_allergies": allergies,
        "critical_conditions": conditions,
        "active_medications": meds
    })

    return {
        "id": profile.id,
        "emergency_id": profile.emergency_id,
        "full_name": user.full_name if user else "Verified Patient",
        "blood_group": profile.blood_group,
        "dob": profile.date_of_birth,
        "gender": profile.gender,
        "primary_language": profile.primary_language,
        "organ_donor": profile.organ_donor,
        "critical_allergies": allergies,
        "critical_conditions": conditions,
        "active_medications": meds,
        "emergency_instructions": profile.emergency_instructions,
        "past_surgeries": profile.past_surgeries,
        "recent_reports": profile.recent_reports,
        "ai_summary": ai_data["summary"],
        "ai_traceability": ai_data["traceability"]
    }

@app.put("/api/patient/{patient_id}")
def update_patient_profile(patient_id: int, req: schemas.AdminPatientUpdateRequest, db: Session = Depends(get_db)):
    profile = db.query(models.PatientProfile).filter(models.PatientProfile.id == patient_id).first()
    if not profile:
        profile = db.query(models.PatientProfile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    if req.full_name is not None:
        user = db.query(models.User).filter(models.User.id == profile.user_id).first()
        if user:
            user.full_name = req.full_name
            
    if req.blood_group is not None:
        profile.blood_group = req.blood_group
    if req.date_of_birth is not None:
        profile.date_of_birth = req.date_of_birth
    if req.gender is not None:
        profile.gender = req.gender
    if req.primary_language is not None:
        profile.primary_language = req.primary_language
    if req.organ_donor is not None:
        profile.organ_donor = req.organ_donor
    if req.critical_allergies is not None:
        profile.critical_allergies = req.critical_allergies
    if req.critical_conditions is not None:
        profile.critical_conditions = req.critical_conditions
    if req.active_medications is not None:
        profile.active_medications = req.active_medications
    if req.emergency_instructions is not None:
        profile.emergency_instructions = req.emergency_instructions
        
    db.commit()
    return {"message": "Patient profile updated successfully"}

@app.get("/api/identity/{patient_id}")
def get_emergency_identity(patient_id: int = 1, db: Session = Depends(get_db)):
    identity = db.query(models.EmergencyIdentity).filter(models.EmergencyIdentity.patient_id == patient_id).first()
    if not identity:
        raise HTTPException(status_code=404, detail="Emergency identity not found")
    return {
        "emergency_id": identity.emergency_id,
        "qr_break_glass_token": identity.qr_break_glass_token,
        "nfc_payload": identity.nfc_payload,
        "printable_card_code": identity.printable_card_code,
        "lockscreen_badge_url": identity.lockscreen_badge_url,
        "is_active": identity.is_active
    }

# --- Module 2: Break-Glass Emergency Access ---
@app.post("/api/break-glass/initiate")
def trigger_break_glass(req: schemas.BreakGlassRequest, db: Session = Depends(get_db)):
    try:
        data = initiate_break_glass_session(
            db=db,
            qr_token=req.qr_token,
            requester_name=req.requester_name,
            requester_role=req.requester_role,
            access_reason=req.access_reason,
            lat=req.latitude,
            lng=req.longitude,
            device_info=req.device_info
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- Module 7 & 8: Hospital Routing & Incident Management ---
@app.post("/api/hospitals/recommend")
def get_recommended_hospitals(req: schemas.HospitalRoutingRequest, db: Session = Depends(get_db)):
    hospitals = recommend_hospitals(
        db=db,
        patient_lat=req.patient_lat,
        patient_lng=req.patient_lng,
        required_specialty=req.required_specialty
    )
    return {"hospitals": hospitals}

@app.get("/api/incidents/active")
def get_active_incident(db: Session = Depends(get_db)):
    incident = db.query(models.EmergencyIncident).filter(models.EmergencyIncident.status != "CLOSED").order_by(models.EmergencyIncident.id.desc()).first()
    if not incident:
        # Create a fresh active incident if none
        now = datetime.datetime.utcnow()
        incident = models.EmergencyIncident(
            incident_code=f"INC-{now.strftime('%Y-%m-%d')}-004281",
            patient_id=1,
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
        db.refresh(incident)

    assigned_hospital = None
    if incident.assigned_hospital_id:
        assigned_hospital = db.query(models.Hospital).filter(models.Hospital.id == incident.assigned_hospital_id).first()

    return {
        "id": incident.id,
        "incident_code": incident.incident_code,
        "patient_id": incident.patient_id,
        "status": incident.status,
        "current_lat": incident.current_lat,
        "current_lng": incident.current_lng,
        "eta_minutes": incident.eta_minutes,
        "assigned_hospital": {
            "id": assigned_hospital.id,
            "name": assigned_hospital.name,
            "phone": assigned_hospital.phone
        } if assigned_hospital else None,
        "created_at": incident.created_at.isoformat(),
        "updated_at": incident.updated_at.isoformat()
    }

@app.post("/api/incidents/update-status")
def update_incident_status(req: schemas.IncidentStateUpdateRequest, db: Session = Depends(get_db)):
    incident = db.query(models.EmergencyIncident).filter(models.EmergencyIncident.incident_code == req.incident_code).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = req.next_status
    if req.assigned_hospital_id:
        incident.assigned_hospital_id = req.assigned_hospital_id
    if req.lat is not None:
        incident.current_lat = req.lat
    if req.lng is not None:
        incident.current_lng = req.lng
    if req.eta_minutes is not None:
        incident.eta_minutes = req.eta_minutes

    incident.updated_at = datetime.datetime.utcnow()
    db.commit()

    # Log audit event for state machine transition
    create_audit_entry(
        db=db,
        user_name="Emergency Dispatch System",
        user_role="SYSTEM",
        patient_id=incident.patient_id,
        access_type="INCIDENT_STATUS_CHANGE",
        access_reason=f"Incident {incident.incident_code} transitioned to status {req.next_status}"
    )

    return {"status": "SUCCESS", "incident_code": incident.incident_code, "new_status": incident.status}

# --- Module 9: Hospital Emergency Handoff ---
@app.post("/api/handoff/send")
def send_emergency_handoff(hospital_id: int, incident_code: str, db: Session = Depends(get_db)):
    patient_data = get_patient_profile(patient_id=1, db=db)
    summary_text = f"CRITICAL HANDOFF FOR {patient_data['full_name']} | Blood: {patient_data['blood_group']} | Allergies: {', '.join(patient_data['critical_allergies'])} | Conditions: {', '.join(patient_data['critical_conditions'])}"

    handoff = models.EmergencyHandoff(
        incident_code=incident_code,
        hospital_id=hospital_id,
        patient_snapshot_summary=summary_text,
        acknowledged=False
    )
    db.add(handoff)
    db.commit()
    db.refresh(handoff)

    return {"status": "HANDOFF_SENT", "handoff_id": handoff.id, "hospital_id": hospital_id}

@app.post("/api/handoff/acknowledge")
def acknowledge_handoff(req: schemas.HandoffAcknowledgeRequest, db: Session = Depends(get_db)):
    handoff = db.query(models.EmergencyHandoff).filter(models.EmergencyHandoff.incident_code == req.incident_code).order_by(models.EmergencyHandoff.id.desc()).first()
    if handoff:
        handoff.acknowledged = True
        handoff.acknowledged_at = datetime.datetime.utcnow()
        handoff.receiving_doctor_notes = req.receiving_doctor_notes
        db.commit()

    # Also transition incident state to HOSPITAL_RECEIVED
    incident = db.query(models.EmergencyIncident).filter(models.EmergencyIncident.incident_code == req.incident_code).first()
    if incident:
        incident.status = "HOSPITAL_RECEIVED"
        incident.updated_at = datetime.datetime.utcnow()
        db.commit()

    create_audit_entry(
        db=db,
        user_name="ER Triage Desk",
        user_role="HOSPITAL_STAFF",
        patient_id=1,
        access_type="HANDOFF_ACKNOWLEDGED",
        access_reason=f"Receiving hospital acknowledged patient handoff: {req.receiving_doctor_notes}"
    )

    return {"status": "SUCCESS", "message": "Emergency Handoff Acknowledged by Hospital ER"}

# --- Module 5: Document Intelligence ---
@app.post("/api/documents/upload-simulated")
def upload_simulated_document(req: schemas.DocumentUploadSimulationRequest, db: Session = Depends(get_db)):
    ocr_result = process_medical_document_ocr(req.title, req.doc_type, req.sample_content)

    doc = models.MedicalDocument(
        patient_id=1,
        title=req.title,
        doc_type=req.doc_type,
        ocr_raw_text=req.sample_content,
        extracted_json=str(ocr_result["extracted_fields"]),
        confidence_score=ocr_result["confidence_score"],
        verification_status="VERIFIED"
    )
    db.add(doc)
    db.commit()

    return ocr_result

@app.get("/api/documents/patient/{patient_id}")
def list_patient_documents(patient_id: int = 1, db: Session = Depends(get_db)):
    docs = db.query(models.MedicalDocument).filter(models.MedicalDocument.patient_id == patient_id).all()
    return [{
        "id": d.id,
        "title": d.title,
        "doc_type": d.doc_type,
        "confidence_score": d.confidence_score,
        "upload_date": d.upload_date.strftime("%Y-%m-%d"),
        "verification_status": d.verification_status,
        "preview": d.ocr_raw_text[:120] if d.ocr_raw_text else ""
    } for d in docs]

# --- Module 13, 14, 15: Tamper-Evident Audit & Security ---
@app.get("/api/audit/logs")
def get_audit_logs(db: Session = Depends(get_db)):
    logs = db.query(models.AuditLog).order_by(models.AuditLog.block_index.desc()).limit(50).all()
    return [{
        "block_index": l.block_index,
        "timestamp": l.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "user_name": l.user_name,
        "user_role": l.user_role,
        "access_type": l.access_type,
        "access_reason": l.access_reason,
        "ip_address": l.ip_address,
        "previous_hash": l.previous_hash,
        "current_hash": l.current_hash
    } for l in logs]

@app.get("/api/audit/verify")
def verify_audit_ledger(db: Session = Depends(get_db)):
    return verify_audit_chain_integrity(db)

@app.post("/api/audit/tamper-test")
def simulate_tampering(db: Session = Depends(get_db)):
    # Tamper with the 2nd block's user_name to demonstrate cryptographic breakage
    block = db.query(models.AuditLog).filter(models.AuditLog.block_index == 1).first()
    if block:
        block.access_reason = "UNAUTHORIZED TAMPERING ATTEMPT BY ATTACKER"
        db.commit()
    return {"status": "TAMPER_SIMULATED", "message": "Block #1 access reason altered in DB. Run integrity verification now to see tamper detection!"}

@app.get("/api/suspicious-alerts")
def get_suspicious_alerts(db: Session = Depends(get_db)):
    alerts = db.query(models.SuspiciousAccessAlert).order_by(models.SuspiciousAccessAlert.id.desc()).all()
    return [{
        "id": a.id,
        "timestamp": a.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "user_name": a.user_name,
        "role": a.role,
        "access_count": a.access_count,
        "risk_level": a.risk_level,
        "reason": a.reason
    } for a in alerts]

# --- Module 18: Emergency Readiness Score ---
@app.get("/api/readiness/{patient_id}")
def get_readiness_score(patient_id: int = 1, db: Session = Depends(get_db)):
    return calculate_emergency_readiness(db, patient_id)

# --- Module 6: Medical Data Normalization ---
@app.post("/api/normalize-term")
def normalize_term(term: str):
    return normalize_medical_term(term)

# --- Module 17: Care Circle ---
@app.get("/api/care-circle/{patient_id}")
def get_care_circle(patient_id: int = 1, db: Session = Depends(get_db)):
    members = db.query(models.CareCircleMember).filter(models.CareCircleMember.patient_id == patient_id).all()
    return [{
        "id": m.id,
        "name": m.name,
        "relationship": m.relationship,
        "phone": m.phone,
        "permission_tier": m.permission_tier,
        "notify_on_break_glass": m.notify_on_break_glass
    } for m in members]

# --- ADMIN PATIENT MANAGEMENT (FULL CRUD) ---
@app.get("/api/admin/patients")
def admin_get_all_patients(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    results = []
    for user in users:
        p = db.query(models.PatientProfile).filter(models.PatientProfile.user_id == user.id).first()
        if not p:
            emg_id = f"EMG-{abs(hash(user.email)) % 10000:04d}-X"
            p = models.PatientProfile(
                user_id=user.id,
                emergency_id=emg_id,
                blood_group="B+",
                date_of_birth="1995-01-01",
                gender="Male",
                primary_language="English",
                organ_donor=True,
                critical_allergies="None declared",
                critical_conditions="None declared",
                active_medications="None declared",
                emergency_instructions="Standard resuscitation protocol."
            )
            db.add(p)
            db.commit()
            db.refresh(p)

        allergies = [a.strip() for a in p.critical_allergies.split(",") if a.strip()] if p.critical_allergies else []
        conditions = [c.strip() for c in p.critical_conditions.split(",") if c.strip()] if p.critical_conditions else []
        meds = [m.strip() for m in p.active_medications.split(",") if m.strip()] if p.active_medications else []

        results.append({
            "id": p.id,
            "user_id": user.id,
            "emergency_id": p.emergency_id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone or "",
            "role": user.role,
            "blood_group": p.blood_group,
            "dob": p.date_of_birth,
            "gender": p.gender,
            "primary_language": p.primary_language,
            "organ_donor": p.organ_donor,
            "critical_allergies": allergies,
            "critical_conditions": conditions,
            "active_medications": meds,
            "emergency_instructions": p.emergency_instructions,
            "past_surgeries": p.past_surgeries,
            "recent_reports": p.recent_reports
        })
    return results

@app.post("/api/admin/patients")
def admin_create_patient(req: schemas.AdminPatientCreateRequest, db: Session = Depends(get_db)):
    from auth_service import hash_password
    existing = db.query(models.User).filter(models.User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    pwd_hash = hash_password("password123")
    user = models.User(
        full_name=req.full_name,
        email=req.email,
        password_hash=pwd_hash,
        role="PATIENT",
        phone=req.phone or "+91 98000 00000"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    emg_id = f"EMG-{abs(hash(req.email)) % 10000:04d}-X"
    profile = models.PatientProfile(
        user_id=user.id,
        emergency_id=emg_id,
        blood_group=req.blood_group,
        date_of_birth=req.date_of_birth or "1995-01-01",
        gender=req.gender or "Male",
        primary_language=req.primary_language or "English",
        organ_donor=req.organ_donor,
        critical_allergies=req.critical_allergies,
        critical_conditions=req.critical_conditions,
        active_medications=req.active_medications,
        emergency_instructions=req.emergency_instructions
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    identity = models.EmergencyIdentity(
        patient_id=profile.id,
        emergency_id=emg_id,
        qr_break_glass_token=f"BG-TOKEN-{profile.id}-ADMIN-KEY",
        nfc_payload=f"https://emergencycare.app/break-glass/BG-TOKEN-{profile.id}-ADMIN-KEY",
        printable_card_code=f"CARD-{emg_id}",
        lockscreen_badge_url=f"https://emergencycare.app/badge/{emg_id}",
        is_active=True
    )
    db.add(identity)
    db.commit()

    return {"message": "Patient profile created successfully", "patient_id": profile.id, "emergency_id": emg_id}

@app.put("/api/admin/patients/{patient_id}")
def admin_update_patient(patient_id: int, req: schemas.AdminPatientUpdateRequest, db: Session = Depends(get_db)):
    profile = db.query(models.PatientProfile).filter(models.PatientProfile.id == patient_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    user = db.query(models.User).filter(models.User.id == profile.user_id).first()
    if user and req.full_name:
        user.full_name = req.full_name
    if user and req.phone:
        user.phone = req.phone
    if user and req.role:
        user.role = req.role.upper()

    if req.blood_group is not None:
        profile.blood_group = req.blood_group
    if req.date_of_birth is not None:
        profile.date_of_birth = req.date_of_birth
    if req.gender is not None:
        profile.gender = req.gender
    if req.primary_language is not None:
        profile.primary_language = req.primary_language
    if req.organ_donor is not None:
        profile.organ_donor = req.organ_donor
    if req.critical_allergies is not None:
        profile.critical_allergies = req.critical_allergies
    if req.critical_conditions is not None:
        profile.critical_conditions = req.critical_conditions
    if req.active_medications is not None:
        profile.active_medications = req.active_medications
    if req.emergency_instructions is not None:
        profile.emergency_instructions = req.emergency_instructions

    db.commit()
    return {"message": "Patient updated successfully"}

# --- ROLE UPDATE REQUEST ENDPOINTS ---
@app.post("/api/role-update-request")
def create_role_update_request(req: schemas.RoleUpdateRequestSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == (req.user_id or 1)).first()
    if not user:
        user = db.query(models.User).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    role_req = models.RoleUpdateRequest(
        user_id=user.id,
        user_name=user.full_name,
        email=user.email,
        current_role=user.role,
        requested_role=req.requested_role.upper(),
        reason=req.reason,
        status="PENDING"
    )
    db.add(role_req)
    db.commit()
    db.refresh(role_req)
    return {"message": "Role update request submitted successfully", "request_id": role_req.id}

@app.get("/api/admin/role-update-requests")
def admin_get_role_update_requests(db: Session = Depends(get_db)):
    reqs = db.query(models.RoleUpdateRequest).order_by(models.RoleUpdateRequest.id.desc()).all()
    return [
        {
            "id": r.id,
            "user_id": r.user_id,
            "user_name": r.user_name,
            "email": r.email,
            "current_role": r.current_role,
            "requested_role": r.requested_role,
            "reason": r.reason,
            "status": r.status,
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else ""
        }
        for r in reqs
    ]

@app.post("/api/admin/role-update-requests/{request_id}/approve")
def admin_approve_role_update(request_id: int, db: Session = Depends(get_db)):
    req_item = db.query(models.RoleUpdateRequest).filter(models.RoleUpdateRequest.id == request_id).first()
    if not req_item:
        raise HTTPException(status_code=404, detail="Role update request not found")
        
    user = db.query(models.User).filter(models.User.id == req_item.user_id).first()
    if user:
        user.role = req_item.requested_role
        
    req_item.status = "APPROVED"
    db.commit()
    return {"message": f"Role updated to {req_item.requested_role} successfully", "user_id": req_item.user_id, "new_role": req_item.requested_role}

@app.post("/api/admin/role-update-requests/{request_id}/reject")
def admin_reject_role_update(request_id: int, db: Session = Depends(get_db)):
    req_item = db.query(models.RoleUpdateRequest).filter(models.RoleUpdateRequest.id == request_id).first()
    if not req_item:
        raise HTTPException(status_code=404, detail="Role update request not found")
        
    req_item.status = "REJECTED"
    db.commit()
    return {"message": "Role update request rejected"}

@app.delete("/api/admin/patients/{patient_id}")
def admin_delete_patient(patient_id: int, db: Session = Depends(get_db)):
    profile = db.query(models.PatientProfile).filter(models.PatientProfile.id == patient_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    db.query(models.EmergencyIdentity).filter(models.EmergencyIdentity.patient_id == patient_id).delete()
    db.query(models.CareCircleMember).filter(models.CareCircleMember.patient_id == patient_id).delete()

    user_id = profile.user_id
    db.delete(profile)
    db.commit()

    if user_id:
        db.query(models.User).filter(models.User.id == user_id).delete()
        db.commit()

    return {"message": "Patient profile and user account deleted successfully"}

