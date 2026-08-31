from sqlalchemy.orm import Session
from models import PatientProfile, CareCircleMember, EmergencyIdentity

def calculate_emergency_readiness(db: Session, patient_id: int = 1) -> dict:
    profile = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    if not profile:
        return {"score": 50, "grade": "NEEDS_ATTENTION", "recommendations": []}

    score = 0
    checks = []

    # 1. Emergency Contact (20 pts)
    contacts = db.query(CareCircleMember).filter(CareCircleMember.patient_id == patient_id).all()
    if len(contacts) >= 1:
        score += 20
        checks.append({"item": "Emergency Care Circle Contact Verified", "passed": True, "pts": 20})
    else:
        checks.append({"item": "Add at least 1 Emergency Care Circle Contact", "passed": False, "pts": 0, "impact": "+20%"})

    # 2. Blood Group Verified (15 pts)
    if profile.blood_group and profile.blood_group != "Unknown":
        score += 15
        checks.append({"item": f"Blood Group Verified ({profile.blood_group})", "passed": True, "pts": 15})
    else:
        checks.append({"item": "Verify and record Blood Group", "passed": False, "pts": 0, "impact": "+15%"})

    # 3. Severe Allergies Recorded (20 pts)
    if profile.critical_allergies:
        score += 20
        checks.append({"item": "Critical Allergies & Sensitivities Recorded", "passed": True, "pts": 20})
    else:
        checks.append({"item": "Confirm or declare allergy status", "passed": False, "pts": 0, "impact": "+20%"})

    # 4. Critical Medications List (15 pts)
    if profile.active_medications:
        score += 15
        checks.append({"item": "Active Emergency Medications List Updated", "passed": True, "pts": 15})
    else:
        checks.append({"item": "Update active daily prescription list", "passed": False, "pts": 0, "impact": "+15%"})

    # 5. Emergency ID / QR Active (15 pts)
    identity = db.query(EmergencyIdentity).filter(EmergencyIdentity.patient_id == patient_id).first()
    if identity and identity.is_active:
        score += 15
        checks.append({"item": "Emergency QR Identity Active", "passed": True, "pts": 15})
    else:
        checks.append({"item": "Activate Emergency QR Card", "passed": False, "pts": 0, "impact": "+15%"})

    # 6. Special Instructions (15 pts)
    if profile.emergency_instructions:
        score += 15
        checks.append({"item": "Emergency Protocol & Resuscitation Instructions Set", "passed": True, "pts": 15})
    else:
        checks.append({"item": "Add explicit emergency responder instructions", "passed": False, "pts": 0, "impact": "+15%"})

    grade = "READY" if score >= 85 else ("MODERATE" if score >= 60 else "CRITICAL_GAPS")

    return {
        "score": score,
        "max_score": 100,
        "grade": grade,
        "checkpoints": checks,
        "summary": f"Emergency Readiness Score: {score}/100 — {'Profile is fully prepared for break-glass emergency response.' if score >= 85 else 'Action required to complete emergency profile.'}"
    }
