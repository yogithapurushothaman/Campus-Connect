from flask import Blueprint, request, jsonify, g
from campus_connect.database.session import db_session
from campus_connect.database.models import TeamRequest, TeamMember, ChatMessage, Notification
from campus_connect.core.middleware import login_required

team_requests_bp = Blueprint("team_requests", __name__, url_prefix="/api/team-requests")

@team_requests_bp.route("", methods=["GET"])
@login_required
def get_team_requests():
    session = db_session()
    requests = session.query(TeamRequest).order_by(TeamRequest.created_at.desc()).all()
    return jsonify({"teamRequests": [r.to_dict() for r in requests]}), 200

@team_requests_bp.route("", methods=["POST"])
@login_required
def create_team_request():
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    category = data.get("category", "Sports").strip()
    description = data.get("description", "").strip()
    max_members = data.get("maxMembers", 5)

    try:
        max_members = int(max_members)
    except (ValueError, TypeError):
        max_members = 5

    if not title or not description:
        return jsonify({"error": "Title and description are required."}), 400

    if category not in ["Sports", "Academics", "Gaming"]:
        category = "Sports"

    session = db_session()
    
    # Create the TeamRequest
    team_req = TeamRequest(
        title=title,
        category=category,
        description=description,
        max_members=max_members,
        creator_id=g.session["id"]
    )
    session.add(team_req)
    session.flush()  # to populate team_req.id

    # Automatically add creator as an approved member
    creator_member = TeamMember(
        request_id=team_req.id,
        student_id=g.session["id"],
        status="approved"
    )
    session.add(creator_member)
    session.commit()

    return jsonify({"message": "Team Finder request created!", "teamRequest": team_req.to_dict()}), 201

@team_requests_bp.route("/<request_id>/join", methods=["POST"])
@login_required
def join_team(request_id):
    session = db_session()
    team_req = session.query(TeamRequest).filter_by(id=request_id).first()
    if not team_req:
        return jsonify({"error": "Team request not found."}), 404

    # Prevent creator from joining their own request
    if team_req.creator_id == g.session["id"]:
        return jsonify({"error": "You are the creator of this request."}), 400

    # Check if already a member
    existing = session.query(TeamMember).filter_by(
        request_id=request_id,
        student_id=g.session["id"]
    ).first()
    
    if existing:
        return jsonify({
            "message": "Already requested to join or member of this team.",
            "teamRequest": team_req.to_dict()
        }), 200

    # Count approved members
    approved_count = session.query(TeamMember).filter_by(
        request_id=request_id,
        status="approved"
    ).count()

    if approved_count >= team_req.max_members:
        return jsonify({"error": "This team is already full."}), 400

    # Add as a pending member
    new_member = TeamMember(
        request_id=request_id,
        student_id=g.session["id"],
        status="pending"
    )
    session.add(new_member)

    # Notify team request creator
    joiner_name = g.session.get("name", "Someone")
    notif = Notification(
        user_id=team_req.creator_id,
        message=f"{joiner_name} requested to join your team '{team_req.title}'.",
        type="team"
    )
    session.add(notif)

    session.commit()

    return jsonify({
        "message": "Join request submitted successfully!",
        "teamRequest": team_req.to_dict()
    }), 200

@team_requests_bp.route("/<request_id>/chat", methods=["GET"])
@login_required
def get_team_chat(request_id):
    session = db_session()
    team_req = session.query(TeamRequest).filter_by(id=request_id).first()
    if not team_req:
        return jsonify({"error": "Team request not found."}), 404

    # Security check: User must be creator or approved member
    is_creator = team_req.creator_id == g.session["id"]
    is_approved_member = session.query(TeamMember).filter_by(
        request_id=request_id,
        student_id=g.session["id"],
        status="approved"
    ).first() is not None

    if not is_creator and not is_approved_member:
        return jsonify({"error": "You must be an approved member to view the chat."}), 403

    messages = session.query(ChatMessage).filter_by(team_request_id=request_id).order_by(ChatMessage.timestamp.asc()).all()
    return jsonify({"messages": [m.to_dict() for m in messages]}), 200

@team_requests_bp.route("/<request_id>/chat", methods=["POST"])
@login_required
def send_team_chat(request_id):
    data = request.get_json() or {}
    message_text = data.get("messageText", "").strip()
    if not message_text:
        return jsonify({"error": "Message text is required."}), 400

    session = db_session()
    team_req = session.query(TeamRequest).filter_by(id=request_id).first()
    if not team_req:
        return jsonify({"error": "Team request not found."}), 404

    # Security check: User must be creator or approved member
    is_creator = team_req.creator_id == g.session["id"]
    is_approved_member = session.query(TeamMember).filter_by(
        request_id=request_id,
        student_id=g.session["id"],
        status="approved"
    ).first() is not None

    if not is_creator and not is_approved_member:
        return jsonify({"error": "You must be an approved member to participate in the chat."}), 403

    msg = ChatMessage(
        team_request_id=request_id,
        sender_id=g.session["id"],
        message_text=message_text
    )
    session.add(msg)
    session.commit()

    return jsonify({"message": "Message sent!", "chatMessage": msg.to_dict()}), 201

