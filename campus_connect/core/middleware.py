from functools import wraps
from flask import request, jsonify, redirect, url_for, g
from campus_connect.core.auth import get_session_from_request
from campus_connect.database.session import db_session
from campus_connect.database.models import User

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        session = get_session_from_request()
        if not session:
            if request.path.startswith("/api/"):
                return jsonify({"error": "Authentication required. Please log in."}), 401
            return redirect(f"/login?redirect={request.path}")

        # Attach to Flask request global context
        g.session = session
        user = db_session.query(User).filter_by(id=session.get("id")).first()
        g.current_user = user
        return f(*args, **kwargs)
    return decorated_function

def require_role(*allowed_roles):
    """
    Role-Based Access Control Decorator.
    Normalizes STAFF and FACULTY into the faculty-tier permission level.
    """
    normalized_allowed = set()
    for r in allowed_roles:
        r_upper = r.upper()
        normalized_allowed.add(r_upper)
        if r_upper in ("FACULTY", "STAFF"):
            normalized_allowed.add("FACULTY")
            normalized_allowed.add("STAFF")

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            session = get_session_from_request()
            if not session:
                if request.path.startswith("/api/"):
                    return jsonify({"error": "Authentication required."}), 401
                return redirect(f"/login?redirect={request.path}")

            user_role = session.get("role", "STUDENT").upper()
            if user_role not in normalized_allowed:
                if request.path.startswith("/api/"):
                    return jsonify({
                        "error": f"Forbidden: This action requires one of the following roles: {', '.join(allowed_roles)}."
                    }), 403
                return redirect("/dashboard?error=unauthorized_role")

            g.session = session
            user = db_session.query(User).filter_by(id=session.get("id")).first()
            g.current_user = user
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Convenience decorators
require_faculty = require_role("FACULTY", "STAFF")
require_student = require_role("STUDENT")
