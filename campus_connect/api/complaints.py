import random
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from campus_connect.database.session import db_session
from campus_connect.database.models import Complaint, ComplaintTimeline
from campus_connect.core.middleware import login_required
from campus_connect.core.ai_helpers import predict_complaint_attributes

complaints_bp = Blueprint("complaints", __name__, url_prefix="/api/complaints")

@complaints_bp.route("", methods=["GET"])
def get_complaints():
    session = db_session()
    status_filter = request.args.get("status")
    query = session.query(Complaint)
    if status_filter and status_filter != "all":
        query = query.filter_by(status=status_filter)
    
    complaints = query.order_by(Complaint.created_at.desc()).all()
    return jsonify({"complaints": [c.to_dict() for c in complaints]}), 200

@complaints_bp.route("", methods=["POST"])
@login_required
def submit_complaint():
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    building_id = data.get("buildingId", "bld_eng_1").strip()
    building_name = data.get("buildingName", "Engineering Block A").strip()
    room_or_area = data.get("roomOrArea", "General Area").strip()
    is_anonymous = bool(data.get("isAnonymous", False))
    photo_url = data.get("photoUrl", "")

    if not title or not description:
        return jsonify({"error": "Title and description are required."}), 400

    # Run automated AI Triage prediction
    ai_prediction = predict_complaint_attributes(title, description, building_name)

    ticket_number = f"TKT-2026-{random.randint(1000, 9999)}"
    session = db_session()
    complaint = Complaint(
        ticket_number=ticket_number,
        title=title,
        category=ai_prediction["predictedCategory"],
        priority=ai_prediction["predictedPriority"],
        status="submitted",
        is_anonymous=is_anonymous,
        author_id=g.session["id"] if not is_anonymous else None,
        author_name=g.session.get("name", "Student") if not is_anonymous else "Anonymous Student",
        building_id=building_id,
        building_name=building_name,
        room_or_area=room_or_area,
        description=description,
        photo_url=photo_url,
        assigned_team=ai_prediction["suggestedTeam"],
        triage_confidence=ai_prediction["confidence"],
    )
    session.add(complaint)
    session.flush()

    timeline_item = ComplaintTimeline(
        complaint_id=complaint.id,
        status="submitted",
        label="Ticket Submitted",
        timestamp=datetime.now(timezone.utc).strftime("%b %d, %Y %I:%M %p"),
        note=f"Auto-triaged by Campus AI to {ai_prediction['suggestedTeam']} with {int(ai_prediction['confidence']*100)}% confidence.",
        updated_by="CampusCare AI Triage",
    )
    session.add(timeline_item)
    session.commit()

    return jsonify({
        "message": f"Complaint registered under ticket #{ticket_number}.",
        "complaint": complaint.to_dict()
    }), 201

@complaints_bp.route("/<complaint_id>/upvote", methods=["POST"])
@login_required
def upvote_complaint(complaint_id):
    session = db_session()
    complaint = session.query(Complaint).filter_by(id=complaint_id).first()
    if not complaint:
        return jsonify({"error": "Complaint not found."}), 404

    complaint.upvotes += 1
    session.commit()
    return jsonify({"message": "Upvoted complaint.", "upvotes": complaint.upvotes}), 200

@complaints_bp.route("/<complaint_id>/status", methods=["PATCH"])
@login_required
def update_complaint_status(complaint_id):
    user_role = g.session.get("role", "STUDENT").upper()
    if user_role not in ("FACULTY", "STAFF"):
        return jsonify({
            "error": "Forbidden: Only faculty members and authorized staff can update complaint resolution states."
        }), 403

    data = request.get_json() or {}
    new_status = data.get("status", "").strip().lower()
    note = data.get("note", "").strip()
    assigned_to = data.get("assignedTo", "").strip()

    valid_statuses = ("submitted", "acknowledged", "assigned", "in_progress", "resolved")
    if new_status not in valid_statuses:
        return jsonify({"error": f"Invalid status. Must be one of {valid_statuses}."}), 400

    session = db_session()
    complaint = session.query(Complaint).filter_by(id=complaint_id).first()
    if not complaint:
        return jsonify({"error": "Complaint not found."}), 404

    complaint.status = new_status
    if assigned_to:
        complaint.assigned_to = assigned_to

    status_labels = {
        "submitted": "Ticket Submitted",
        "acknowledged": "Acknowledged & Verified by Faculty Advisor",
        "assigned": f"Assigned to {assigned_to or complaint.assigned_team}",
        "in_progress": "Resolution In Progress",
        "resolved": "Resolved & Verified"
    }

    timeline_item = ComplaintTimeline(
        complaint_id=complaint.id,
        status=new_status,
        label=status_labels.get(new_status, new_status.title()),
        timestamp=datetime.now(timezone.utc).strftime("%b %d, %Y %I:%M %p"),
        note=note or f"Status updated by {g.session.get('name', 'Faculty')}.",
        updated_by=g.session.get("name", "Faculty"),
    )
    session.add(timeline_item)
    session.commit()

    return jsonify({
        "message": f"Ticket #{complaint.ticket_number} status updated to {new_status}.",
        "complaint": complaint.to_dict()
    }), 200

@complaints_bp.route("/<complaint_id>/note", methods=["POST"])
@login_required
def add_admin_note(complaint_id):
    user_role = g.session.get("role", "STUDENT").upper()
    if user_role not in ("FACULTY", "STAFF"):
        return jsonify({"error": "Forbidden: Faculty credentials required."}), 403

    data = request.get_json() or {}
    note = data.get("note", "").strip()
    if not note:
        return jsonify({"error": "Note cannot be empty."}), 400

    session = db_session()
    complaint = session.query(Complaint).filter_by(id=complaint_id).first()
    if not complaint:
        return jsonify({"error": "Complaint not found."}), 404

    complaint.admin_notes = note
    session.commit()

    return jsonify({
        "message": "Internal note saved.",
        "adminNotes": complaint.admin_notes
    }), 200
