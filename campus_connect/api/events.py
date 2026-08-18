from flask import Blueprint, request, jsonify, g
from campus_connect.database.session import db_session
from campus_connect.database.models import Event
from campus_connect.core.middleware import login_required

events_bp = Blueprint("events", __name__, url_prefix="/api/events")

@events_bp.route("", methods=["GET"])
def get_events():
    author_id = request.args.get("authorId")
    session = db_session()
    query = session.query(Event)
    if author_id:
        query = query.filter_by(author_id=author_id)
    
    events = query.order_by(Event.created_at.desc()).all()
    return jsonify({"events": [e.to_dict() for e in events]}), 200

@events_bp.route("", methods=["POST"])
@login_required
def create_event():
    user_role = g.session.get("role", "STUDENT").upper()
    if user_role not in ("FACULTY", "STAFF"):
        return jsonify({
            "error": "Forbidden: Only faculty and staff members are authorized to create official campus events."
        }), 403

    data = request.get_json() or {}
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    date = data.get("date", "").strip()
    category = data.get("category", "Workshop").strip()
    location_name = data.get("locationName", "Main Campus").strip()
    department = data.get("department", g.session.get("department", "General")).strip()
    banner_image = data.get("bannerImage", "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80")

    if not title or not description or not date:
        return jsonify({"error": "Title, description, and date are required."}), 400

    session = db_session()
    new_event = Event(
        title=title,
        description=description,
        date=date,
        category=category,
        location_name=location_name,
        department=department,
        banner_image=banner_image,
        is_official=True,
        author_id=g.session["id"]
    )
    session.add(new_event)
    session.commit()

    return jsonify({
        "message": "Event published successfully.",
        "event": new_event.to_dict()
    }), 201
