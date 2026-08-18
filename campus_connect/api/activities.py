import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify, g
from campus_connect.database.session import db_session
from campus_connect.database.models import Activity, ActivityParticipant
from campus_connect.core.middleware import login_required

activities_bp = Blueprint("activities", __name__, url_prefix="/api/activities")

@activities_bp.route("", methods=["GET"])
def get_activities():
    session = db_session()
    category = request.args.get("category")
    query = session.query(Activity)
    if category and category != "all":
        query = query.filter_by(category=category)
    
    activities = query.order_by(Activity.created_at.desc()).all()
    return jsonify({"activities": [a.to_dict() for a in activities]}), 200

@activities_bp.route("", methods=["POST"])
@login_required
def create_activity():
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    category = data.get("category", "study").strip()
    min_participants = int(data.get("minParticipants", 2))
    max_participants = int(data.get("maxParticipants", 6))
    date = data.get("date", "Today").strip()
    time = data.get("time", "05:00 PM").strip()
    location_name = data.get("locationName", "Central Library").strip()
    building_id = data.get("buildingId", "bld_lib_1").strip()
    tags = data.get("tags", "Casual, Campus")

    if not title or not description:
        return jsonify({"error": "Title and description are required."}), 400

    session = db_session()
    chat_id = f"chat_{uuid.uuid4().hex[:8]}"
    activity = Activity(
        title=title,
        description=description,
        category=category,
        creator_id=g.session["id"],
        creator_name=g.session.get("name", "Student"),
        creator_avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        min_participants=min_participants,
        max_participants=max_participants,
        date=date,
        time=time,
        location_name=location_name,
        building_id=building_id,
        tags=tags if isinstance(tags, str) else ", ".join(tags),
        chat_id=chat_id,
        status="open",
    )
    session.add(activity)
    session.flush()

    host_participant = ActivityParticipant(
        activity_id=activity.id,
        user_id=g.session["id"],
        user_name=g.session.get("name", "Student"),
        user_avatar=activity.creator_avatar,
        role="host",
        joined_at="Just now",
    )
    session.add(host_participant)
    session.commit()

    return jsonify({"message": "Activity squad launched!", "activity": activity.to_dict()}), 201

@activities_bp.route("/<activity_id>/join", methods=["POST"])
@login_required
def join_activity(activity_id):
    session = db_session()
    activity = session.query(Activity).filter_by(id=activity_id).first()
    if not activity:
        return jsonify({"error": "Activity not found."}), 404

    # Check if already joined
    existing = session.query(ActivityParticipant).filter_by(
        activity_id=activity_id, user_id=g.session["id"]
    ).first()
    if existing:
        return jsonify({"message": "Already a member of this squad.", "activity": activity.to_dict()}), 200

    if len(activity.participants) >= activity.max_participants:
        return jsonify({"error": "Squad is full!"}), 400

    participant = ActivityParticipant(
        activity_id=activity_id,
        user_id=g.session["id"],
        user_name=g.session.get("name", "Student"),
        user_avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        role="member",
        joined_at="Just now",
    )
    session.add(participant)
    
    if len(activity.participants) + 1 >= activity.max_participants:
        activity.status = "full"

    session.commit()
    return jsonify({"message": "Joined squad successfully!", "activity": activity.to_dict()}), 200

@activities_bp.route("/<activity_id>/leave", methods=["POST"])
@login_required
def leave_activity(activity_id):
    session = db_session()
    activity = session.query(Activity).filter_by(id=activity_id).first()
    if not activity:
        return jsonify({"error": "Activity not found."}), 404

    participant = session.query(ActivityParticipant).filter_by(
        activity_id=activity_id, user_id=g.session["id"]
    ).first()
    if participant:
        session.delete(participant)
        if activity.status == "full":
            activity.status = "open"
        session.commit()

    return jsonify({"message": "Left squad.", "activity": activity.to_dict()}), 200
