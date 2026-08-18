import time
import jwt
from datetime import datetime, timezone, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from flask import request
from campus_connect.config import Config

AUTH_COOKIE_NAME = Config.AUTH_COOKIE_NAME

def hash_password(password: str) -> str:
    """Hash password using cryptographically secure PBKDF2/scrypt"""
    return generate_password_hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    """Verify plain password against stored hash"""
    return check_password_hash(password_hash, password)

def is_institutional_email(email: str) -> bool:
    """Verify if email belongs to an approved institutional domain"""
    if not email or "@" not in email:
        return False
    domain = email.lower().split("@")[-1]
    for allowed in Config.ALLOWED_EMAIL_DOMAINS:
        if domain == allowed or domain.endswith(f".{allowed}"):
            return True
    return False

def detect_role_from_email(email: str, requested_role: str = None) -> str:
    """
    Intelligently determine role from institutional email address metadata or explicit registration.
    """
    normalized = email.lower().strip()
    prefix = normalized.split("@")[0]

    faculty_prefixes = ("prof.", "dr.", "faculty.", "hod.", "dean.", "instructor.")
    if any(prefix.startswith(fp) for fp in faculty_prefixes) or "faculty" in normalized:
        return "FACULTY"

    if requested_role and requested_role.upper() in ("FACULTY", "STAFF", "STUDENT"):
        return requested_role.upper()

    return "STUDENT"

def sign_auth_token(payload: dict) -> str:
    """Sign JWT token containing user payload with 7-day expiration"""
    token_payload = payload.copy()
    now_utc = datetime.now(timezone.utc)
    exp = now_utc + timedelta(days=Config.JWT_EXPIRATION_DAYS)
    token_payload["exp"] = exp
    token_payload["iat"] = now_utc
    return jwt.encode(token_payload, Config.JWT_SECRET, algorithm=Config.JWT_ALGORITHM)

def verify_auth_token(token: str) -> dict | None:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, Config.JWT_SECRET, algorithms=[Config.JWT_ALGORITHM])
        return payload
    except Exception:
        return None

def get_session_from_request() -> dict | None:
    """Extract authenticated user session from cookie or Authorization header"""
    token = request.cookies.get(AUTH_COOKIE_NAME)
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]
    
    if not token:
        return None
    
    return verify_auth_token(token)
