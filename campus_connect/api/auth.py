from flask import Blueprint, request, jsonify, make_response
from campus_connect.database.session import db_session
from campus_connect.database.models import User
from campus_connect.core.auth import (
    hash_password, verify_password, sign_auth_token,
    detect_role_from_email, is_institutional_email,
    get_session_from_request, AUTH_COOKIE_NAME
)
from campus_connect.config import Config

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    requested_role = data.get("role", "").strip()
    department = data.get("department", "Computer Science & Engineering").strip()
    designation = data.get("designation", "").strip()
    id_number = data.get("studentOrFacultyId", "").strip()

    if not name or not email or not password:
        return jsonify({"error": "Name, institutional email, and password are required."}), 400

    if not is_institutional_email(email):
        return jsonify({
            "error": "Please provide a valid institutional email address (e.g., @college.edu or @campus.edu)."
        }), 400

    session = db_session()
    existing_user = session.query(User).filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "An account with this email address already exists."}), 409

    role = detect_role_from_email(email, requested_role)
    if not designation:
        designation = "Professor / Faculty" if role in ("FACULTY", "STAFF") else "Student"

    hashed_pw = hash_password(password)
    user = User(
        name=name,
        email=email,
        password=hashed_pw,
        role=role,
        department=department,
        designation=designation,
        student_or_faculty_id=id_number,
        is_verified=True,
    )
    session.add(user)
    session.commit()

    token_payload = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "department": user.department,
        "designation": user.designation,
    }
    token = sign_auth_token(token_payload)

    target_dashboard = "/faculty-dashboard" if role in ("FACULTY", "STAFF") else "/student-dashboard"

    response = make_response(jsonify({
        "message": "Institutional account created successfully.",
        "token": token,
        "user": user.to_dict(),
        "redirectTo": target_dashboard,
    }), 201)

    response.set_cookie(
        AUTH_COOKIE_NAME,
        token,
        httponly=True,
        samesite="Lax",
        path="/",
        max_age=Config.JWT_EXPIRATION_DAYS * 86400
    )
    return response

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    selected_role_tab = data.get("role", "").strip().upper()

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    session = db_session()
    user = session.query(User).filter_by(email=email).first()
    if not user or not verify_password(password, user.password):
        return jsonify({"error": "Invalid email or password."}), 401

    user_is_faculty = user.role in ("FACULTY", "STAFF")
    if selected_role_tab:
        if selected_role_tab in ("FACULTY", "STAFF") and not user_is_faculty:
            return jsonify({
                "error": "This account is registered as a Student. Please switch to the Student login."
            }), 403
        if selected_role_tab == "STUDENT" and user_is_faculty:
            return jsonify({
                "error": f"This account is registered as Faculty ({user.designation}). Please switch to the Faculty login."
            }), 403

    token_payload = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "department": user.department,
        "designation": user.designation,
    }
    token = sign_auth_token(token_payload)

    target_dashboard = "/faculty-dashboard" if user_is_faculty else "/student-dashboard"

    response = make_response(jsonify({
        "message": "Logged in successfully.",
        "token": token,
        "user": user.to_dict(),
        "redirectTo": target_dashboard,
    }), 200)

    response.set_cookie(
        AUTH_COOKIE_NAME,
        token,
        httponly=True,
        samesite="Lax",
        path="/",
        max_age=Config.JWT_EXPIRATION_DAYS * 86400
    )
    return response

@auth_bp.route("/logout", methods=["GET", "POST"])
def logout():
    response = make_response(jsonify({
        "message": "Logged out successfully.",
        "redirectTo": "/login"
    }), 200)

    response.set_cookie(
        AUTH_COOKIE_NAME,
        "",
        httponly=True,
        samesite="Lax",
        path="/",
        max_age=0
    )
    return response

@auth_bp.route("/me", methods=["GET"])
def me():
    session_data = get_session_from_request()
    if not session_data:
        return jsonify({"error": "Unauthenticated"}), 401

    session = db_session()
    user = session.query(User).filter_by(id=session_data.get("id")).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"user": user.to_dict()}), 200
