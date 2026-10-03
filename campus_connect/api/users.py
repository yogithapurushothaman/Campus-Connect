from flask import Blueprint, jsonify, g
from campus_connect.database.session import db_session
from campus_connect.database.models import User, Event, EventRSVP, Complaint
from campus_connect.core.middleware import login_required

users_bp = Blueprint("users", __name__, url_prefix="/api/users")

@users_bp.route("/me/profile", methods=["GET"])
@login_required
def get_my_profile():
    session = db_session()
    user_id = g.session["id"]

    # 1. Fetch User Info
    user = session.query(User).filter_by(id=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # 2. Fetch Event objects user RSVP'd to
    rsvped_events = (
        session.query(Event)
        .join(EventRSVP, Event.id == EventRSVP.event_id)
        .filter(EventRSVP.user_id == user_id)
        .order_by(Event.created_at.desc())
        .all()
    )

    # 3. Fetch User's complaints
    user_complaints = (
        session.query(Complaint)
        .filter(Complaint.author_id == user_id)
        .order_by(Complaint.created_at.desc())
        .all()
    )

    return jsonify({
        "user": user.to_dict(),
        "rsvps": [e.to_dict() for e in rsvped_events],
        "complaints": [c.to_dict() for c in user_complaints]
    }), 200
