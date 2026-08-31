import hashlib
import hmac
import base64
import json
import time

SECRET_KEY = "EMERGENCY_CARE_SUPER_SECRET_JWT_KEY_2026"
ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    """Hashes password with SHA256 + secret salt."""
    salted = f"{SECRET_KEY}:{password}".encode('utf-8')
    return hashlib.sha256(salted).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict, expires_delta_seconds: int = 86400) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = data.copy()
    payload["exp"] = int(time.time()) + expires_delta_seconds
    
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    
    signature_base = f"{header_b64}.{payload_b64}"
    signature = hmac.new(SECRET_KEY.encode(), signature_base.encode(), hashlib.sha256).digest()
    signature_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    
    return f"{header_b64}.{payload_b64}.{signature_b64}"

def verify_access_token(token: str) -> dict:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, signature_b64 = parts
        
        # Verify signature
        signature_base = f"{header_b64}.{payload_b64}"
        expected_sig = hmac.new(SECRET_KEY.encode(), signature_base.encode(), hashlib.sha256).digest()
        expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).decode().rstrip("=")
        
        if not hmac.compare_digest(signature_b64, expected_sig_b64):
            return None
        
        # Decode payload
        padding = "=" * (4 - len(payload_b64) % 4)
        payload_json = base64.urlsafe_b64decode(payload_b64 + padding).decode()
        payload = json.loads(payload_json)
        
        if payload.get("exp") and time.time() > payload["exp"]:
            return None # Expired
            
        return payload
    except Exception as e:
        return None
