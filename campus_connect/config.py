import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'campusconnect-super-secret-jwt-key-2026')
    JWT_SECRET = os.environ.get('JWT_SECRET', 'campusconnect-super-secret-jwt-key-2026')
    JWT_ALGORITHM = 'HS256'
    JWT_EXPIRATION_DAYS = 7
    AUTH_COOKIE_NAME = 'auth_token'
    
    # Database
    DATABASE_URL = os.environ.get('DATABASE_URL', f'sqlite:///{BASE_DIR / "dev.db"}')
    
    # Institutional Email Verification
    ALLOWED_EMAIL_DOMAINS = ['college.edu', 'campus.edu', 'university.edu', 'edu', 'ac.in']
    
    # Static & Templates
    STATIC_FOLDER = BASE_DIR / 'campus_connect' / 'static'
    TEMPLATES_FOLDER = BASE_DIR / 'campus_connect' / 'templates'
