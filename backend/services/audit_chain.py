import hashlib
import datetime
from sqlalchemy.orm import Session
from models import AuditLog, SuspiciousAccessAlert

GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

def calculate_block_hash(previous_hash: str, timestamp_str: str, user_name: str, user_role: str, access_type: str, access_reason: str) -> str:
    raw_payload = f"{previous_hash}|{timestamp_str}|{user_name}|{user_role}|{access_type}|{access_reason}"
    return hashlib.sha256(raw_payload.encode('utf-8')).hexdigest()

def create_audit_entry(
    db: Session,
    user_name: str,
    user_role: str,
    patient_id: int,
    access_type: str,
    access_reason: str,
    ip_address: str = "127.0.0.1"
) -> AuditLog:
    last_block = db.query(AuditLog).order_by(AuditLog.id.desc()).first()
    
    if last_block:
        block_index = last_block.block_index + 1
        previous_hash = last_block.current_hash
    else:
        block_index = 1
        previous_hash = GENESIS_HASH

    now = datetime.datetime.utcnow()
    timestamp_str = now.isoformat()
    
    current_hash = calculate_block_hash(
        previous_hash=previous_hash,
        timestamp_str=timestamp_str,
        user_name=user_name,
        user_role=user_role,
        access_type=access_type,
        access_reason=access_reason
    )

    log_entry = AuditLog(
        block_index=block_index,
        timestamp=now,
        user_name=user_name,
        user_role=user_role,
        patient_id=patient_id,
        access_type=access_type,
        access_reason=access_reason,
        ip_address=ip_address,
        previous_hash=previous_hash,
        current_hash=current_hash
    )

    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)

    # Check suspicious frequency (e.g. > 3 accesses in 5 mins by same user)
    five_mins_ago = now - datetime.timedelta(minutes=5)
    recent_count = db.query(AuditLog).filter(
        AuditLog.user_name == user_name,
        AuditLog.timestamp >= five_mins_ago
    ).count()

    if recent_count >= 3:
        alert = SuspiciousAccessAlert(
            timestamp=now,
            user_name=user_name,
            role=user_role,
            access_count=recent_count,
            time_window_minutes=5,
            risk_level="HIGH",
            reason=f"High frequency access detected: {recent_count} sensitive requests in <5 mins."
        )
        db.add(alert)
        db.commit()

    return log_entry

def verify_audit_chain_integrity(db: Session) -> dict:
    blocks = db.query(AuditLog).order_by(AuditLog.block_index.asc()).all()
    if not blocks:
        return {
            "is_valid": True,
            "total_blocks": 0,
            "verified_at": datetime.datetime.utcnow().isoformat(),
            "details": "Audit chain is empty. Genesis ready."
        }

    expected_prev = GENESIS_HASH
    for i, b in enumerate(blocks):
        if b.previous_hash != expected_prev:
            return {
                "is_valid": False,
                "total_blocks": len(blocks),
                "failed_at_block": b.block_index,
                "verified_at": datetime.datetime.utcnow().isoformat(),
                "details": f"CRITICAL: Hash mismatch at Block #{b.block_index}! Previous hash link broken."
            }

        recalculated = calculate_block_hash(
            previous_hash=b.previous_hash,
            timestamp_str=b.timestamp.isoformat(),
            user_name=b.user_name,
            user_role=b.user_role,
            access_type=b.access_type,
            access_reason=b.access_reason
        )

        if recalculated != b.current_hash:
            return {
                "is_valid": False,
                "total_blocks": len(blocks),
                "failed_at_block": b.block_index,
                "verified_at": datetime.datetime.utcnow().isoformat(),
                "details": f"TAMPER DETECTED at Block #{b.block_index}! Record content has been modified."
            }

        expected_prev = b.current_hash

    return {
        "is_valid": True,
        "total_blocks": len(blocks),
        "verified_at": datetime.datetime.utcnow().isoformat(),
        "details": f"ALL {len(blocks)} BLOCKS VALID. Cryptographic hash chain unbroken."
    }
