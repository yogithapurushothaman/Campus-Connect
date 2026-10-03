from flask import Blueprint, request, jsonify, g
from campus_connect.database.session import db_session
from campus_connect.database.models import Notice
from campus_connect.core.middleware import login_required

notices_bp = Blueprint("notices", __name__, url_prefix="/api/notices")

@notices_bp.route("", methods=["GET"])
def get_notices():
    session = db_session()
    notices = session.query(Notice).order_by(Notice.created_at.desc()).all()
    return jsonify({"notices": [n.to_dict() for n in notices]}), 200

@notices_bp.route("", methods=["POST"])
@login_required
def create_notice():
    user_role = g.session.get("role", "STUDENT").upper()
    if user_role not in ("FACULTY", "STAFF"):
        return jsonify({
            "error": "Forbidden: Only faculty and staff members are authorized to post official notices."
        }), 403

    data = request.get_json() or {}
    title = data.get("title", "").strip()
    content = data.get("content", "").strip()

    if not title or not content:
        return jsonify({"error": "Title and content are required."}), 400

    session = db_session()
    new_notice = Notice(
        title=title,
        content=content,
        author_id=g.session["id"]
    )
    session.add(new_notice)
    session.commit()

    return jsonify({
        "message": "Notice posted successfully.",
        "notice": new_notice.to_dict()
    }), 201
