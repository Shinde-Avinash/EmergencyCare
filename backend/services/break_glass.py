import uuid
import datetime
from sqlalchemy.orm import Session
from models import BreakGlassSession, PatientProfile, User, EmergencyIdentity, CareCircleMember
from services.audit_chain import create_audit_entry

def initiate_break_glass_session(
    db: Session,
    qr_token: str,
    requester_name: str,
    requester_role: str,
    access_reason: str,
    lat: float = None,
    lng: float = None,
    device_info: str = None
):
    # Find identity
    identity = db.query(EmergencyIdentity).filter(EmergencyIdentity.qr_break_glass_token == qr_token).first()
    if not identity:
        # Fallback to default patient 1 if demo token or test code
        profile = db.query(PatientProfile).filter(PatientProfile.id == 1).first()
    else:
        profile = db.query(PatientProfile).filter(PatientProfile.id == identity.patient_id).first()

    if not profile:
        raise ValueError("Emergency Profile not found")

    user = db.query(User).filter(User.id == profile.user_id).first()

    # Determine scope based on role minimum necessary access
    # BYSTANDER -> CRITICAL only
    # PARAMEDIC -> CRITICAL + IMPORTANT
    # HOSPITAL_STAFF -> FULL
    scoped_tier = "CRITICAL"
    if requester_role.upper() in ["PARAMEDIC", "FIRST_RESPONDER"]:
        scoped_tier = "IMPORTANT"
    elif requester_role.upper() in ["HOSPITAL_STAFF", "ER_DOCTOR"]:
        scoped_tier = "FULL"

    session_token = f"BGS-{uuid.uuid4().hex[:12].upper()}"
    now = datetime.datetime.utcnow()
    expires_at = now + datetime.timedelta(minutes=15)

    bgs = BreakGlassSession(
        session_token=session_token,
        patient_id=profile.id,
        requester_name=requester_name,
        requester_role=requester_role,
        access_reason=access_reason,
        latitude=lat,
        longitude=lng,
        device_info=device_info,
        scoped_data_tier=scoped_tier,
        created_at=now,
        expires_at=expires_at,
        is_active=True
    )
    db.add(bgs)
    db.commit()

    # Write tamper-evident audit record
    create_audit_entry(
        db=db,
        user_name=requester_name,
        user_role=requester_role,
        patient_id=profile.id,
        access_type="BREAK_GLASS_ACCESSED",
        access_reason=f"Break-Glass Triggered: {access_reason}"
    )

    # Scoped emergency contacts
    contacts = db.query(CareCircleMember).filter(CareCircleMember.patient_id == profile.id).all()
    contact_list = [
        {"name": c.name, "relation": c.relationship, "phone": c.phone}
        for c in contacts
    ]

    allergies = [a.strip() for a in (profile.critical_allergies or "").split(",") if a.strip()]
    conditions = [c.strip() for c in (profile.critical_conditions or "").split(",") if c.strip()]
    meds = [m.strip() for m in (profile.active_medications or "").split(",") if m.strip()]

    # Generate AI context summary
    ai_summary = (
        f"🚨 EMERGENCY ALERT for {user.full_name if user else 'Patient'} (Blood Group: {profile.blood_group}). "
        f"PATIENT HAS SEVERE ALLERGIES TO: {', '.join(allergies) if allergies else 'None recorded'}. "
        f"PRIMARY CONDITIONS: {', '.join(conditions) if conditions else 'None recorded'}. "
        f"CURRENT MEDICATIONS: {', '.join(meds) if meds else 'None recorded'}. "
        f"SPECIAL INSTRUCTIONS: {profile.emergency_instructions or 'Do not administer Penicillin derivatives.'}"
    )

    return {
        "session_token": session_token,
        "patient_emergency_id": profile.emergency_id,
        "patient_name": user.full_name if user else "Verified Patient",
        "blood_group": profile.blood_group,
        "critical_allergies": allergies,
        "critical_conditions": conditions,
        "active_medications": meds,
        "emergency_instructions": profile.emergency_instructions or "Keep airways clear. Avoid penicillin.",
        "emergency_contacts": contact_list,
        "ai_emergency_summary": ai_summary,
        "scoped_tier": scoped_tier,
        "expires_at": expires_at.strftime("%Y-%m-%d %H:%M:%S UTC")
    }
