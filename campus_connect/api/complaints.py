import random
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from sqlalchemy import or_
from campus_connect.database.session import db_session
from campus_connect.database.models import Complaint, ComplaintTimeline, Notification
from campus_connect.core.middleware import login_required
from campus_connect.core.ai_helpers import predict_complaint_attributes

complaints_bp = Blueprint("complaints", __name__, url_prefix="/api/complaints")

def normalize_category_input(cat_str: str) -> str:
    if not cat_str:
        return "Other"
    raw = cat_str.strip().lower()
    if "wifi" in raw or "wi-fi" in raw or "net" in raw or "internet" in raw:
        return "Wi-Fi"
    elif "mess" in raw or "food" in raw or "canteen" in raw or "dining" in raw:
        return "Mess"
    elif "infra" in raw or "water" in raw or "electric" in raw or "room" in raw or "light" in raw:
        return "Infrastructure"
    elif "other" in raw:
        return "Other"
    return cat_str.strip()

def normalize_status_input(status_str: str) -> str:
    if not status_str:
        return "Submitted"
    raw = status_str.strip().lower()
    if raw in ("submitted", "new", "open"):
        return "Submitted"
    elif raw in ("in_progress", "in progress", "assigned", "acknowledged"):
        return "In Progress"
    elif raw in ("resolved", "completed", "closed"):
        return "Resolved"
    return status_str.strip()

def serialize_complaint(complaint, requester_role):
    data = complaint.to_dict()
    if complaint.is_anonymous and requester_role not in ("FACULTY", "STAFF"):
        data["authorName"] = "Anonymous Student"
        data["author_name"] = "Anonymous Student"
        data["studentId"] = None
        data["student_id"] = None
        data["authorId"] = None
        data["author_id"] = None
    return data

@complaints_bp.route("", methods=["GET"])
@login_required
def get_complaints():
    """
    Fetch all complaints.
    Accessible to Faculty/Staff and general authenticated users.
    Supports optional ?status= and ?category= query filters.
    """
    session = db_session()
    status_filter = request.args.get("status")
    category_filter = request.args.get("category")

    query = session.query(Complaint)
    if status_filter and status_filter.lower() != "all":
        norm_status = normalize_status_input(status_filter)
        query = query.filter(
            or_(
                Complaint.status == norm_status,
                Complaint.status == norm_status.lower(),
                Complaint.status == norm_status.lower().replace(" ", "_")
            )
        )

    if category_filter and category_filter.lower() != "all":
        norm_cat = normalize_category_input(category_filter)
        query = query.filter(
            or_(
                Complaint.category == norm_cat,
                Complaint.category == norm_cat.lower()
            )
        )

    complaints = query.order_by(Complaint.created_at.desc()).all()
    user_role = g.session.get("role", "STUDENT").upper()
    return jsonify({"complaints": [serialize_complaint(c, user_role) for c in complaints]}), 200

@complaints_bp.route("/me", methods=["GET"])
@login_required
def get_my_complaints():
    """
    Fetch complaints submitted by the authenticated student.
    """
    current_user_id = g.session.get("id")
    session = db_session()
    complaints = (
        session.query(Complaint)
        .filter(
            or_(
                Complaint.student_id == current_user_id,
                Complaint.author_id == current_user_id
            )
        )
        .order_by(Complaint.created_at.desc())
        .all()
    )
    user_role = g.session.get("role", "STUDENT").upper()
    return jsonify({"complaints": [serialize_complaint(c, user_role) for c in complaints]}), 200

@complaints_bp.route("", methods=["POST"])
@login_required
def submit_complaint():
    """
    Submit a new complaint ticket.
    Assigns ticket to authenticated student and defaults status to 'Submitted'.
    """
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    category_input = data.get("category", "").strip()
    building_id = data.get("buildingId", data.get("building_id", "bld_eng_1")).strip()
    building_name = data.get("buildingName", data.get("building_name", "Engineering Block A")).strip()
    room_or_area = data.get("roomOrArea", data.get("room_or_area", "General Area")).strip()
    is_anonymous = bool(data.get("isAnonymous", data.get("is_anonymous", False)))
    photo_url = data.get("photoUrl", data.get("photo_url", ""))

    if not title or not description:
        return jsonify({"error": "Title and description are required."}), 400

    # Determine category
    if category_input:
        category = normalize_category_input(category_input)
    else:
        # Fallback to AI prediction if not specified
        ai_prediction = predict_complaint_attributes(title, description, building_name)
        category = normalize_category_input(ai_prediction.get("predictedCategory", "Other"))

    # Determine assigned team & triage
    ai_prediction = predict_complaint_attributes(title, description, building_name)
    priority = ai_prediction.get("predictedPriority", "Medium")
    assigned_team = ai_prediction.get("suggestedTeam", "Campus Facilities Division")
    triage_confidence = ai_prediction.get("confidence", 0.92)

    current_user_id = g.session.get("id")
    current_user_name = g.session.get("name", "Student")
    ticket_number = f"TKT-2026-{random.randint(1000, 9999)}"

    session = db_session()
    complaint = Complaint(
        ticket_number=ticket_number,
        title=title,
        description=description,
        category=category,
        priority=priority,
        status="Submitted",
        is_anonymous=is_anonymous,
        student_id=current_user_id,
        author_id=current_user_id if not is_anonymous else None,
        author_name=current_user_name if not is_anonymous else "Anonymous Student",
        building_id=building_id,
        building_name=building_name,
        room_or_area=room_or_area,
        photo_url=photo_url,
        assigned_team=assigned_team,
        triage_confidence=triage_confidence,
    )
    session.add(complaint)
    session.flush()

    timeline_item = ComplaintTimeline(
        complaint_id=complaint.id,
        status="Submitted",
        label="Ticket Submitted",
        timestamp=datetime.now(timezone.utc).strftime("%b %d, %Y %I:%M %p"),
        note=f"Ticket submitted under category '{category}'. Triaged to {assigned_team}.",
        updated_by="CampusCare System",
    )
    session.add(timeline_item)
    session.commit()

    return jsonify({
        "message": f"Complaint registered under ticket #{ticket_number}.",
        "complaint": complaint.to_dict()
    }), 201

@complaints_bp.route("/<complaint_id>/status", methods=["PATCH"])
@login_required
def update_complaint_status(complaint_id):
    """
    Update ticket status.
    Strictly protected for Faculty and Staff members.
    """
    user_role = g.session.get("role", "STUDENT").upper()
    if user_role not in ("FACULTY", "STAFF"):
        return jsonify({
            "error": "Forbidden: Only faculty members and authorized staff can update complaint resolution states."
        }), 403

    data = request.get_json() or {}
    new_status_raw = data.get("status", "").strip()
    if not new_status_raw:
        return jsonify({"error": "Status is required."}), 400

    normalized_status = normalize_status_input(new_status_raw)
    valid_statuses = ("Submitted", "In Progress", "Resolved")
    if normalized_status not in valid_statuses:
        return jsonify({"error": f"Invalid status. Must be one of {valid_statuses}."}), 400

    note = data.get("note", "").strip()
    assigned_to = data.get("assignedTo", data.get("assigned_to", "")).strip()

    session = db_session()
    complaint = session.query(Complaint).filter_by(id=complaint_id).first()
    if not complaint:
        return jsonify({"error": "Complaint not found."}), 404

    complaint.status = normalized_status
    if assigned_to:
        complaint.assigned_to = assigned_to

    status_labels = {
        "Submitted": "Ticket Submitted",
        "In Progress": "Resolution In Progress",
        "Resolved": "Resolved & Verified"
    }

    timeline_item = ComplaintTimeline(
        complaint_id=complaint.id,
        status=normalized_status,
        label=status_labels.get(normalized_status, normalized_status),
        timestamp=datetime.now(timezone.utc).strftime("%b %d, %Y %I:%M %p"),
        note=note or f"Status updated to '{normalized_status}' by {g.session.get('name', 'Faculty')}.",
        updated_by=g.session.get("name", "Faculty"),
    )
    session.add(timeline_item)

    # Notify student of status change
    target_user_id = complaint.student_id or complaint.author_id
    if target_user_id:
        notif = Notification(
            user_id=target_user_id,
            message=f"Faculty updated the status of your complaint: '{complaint.title}' to '{normalized_status}'.",
            type="complaint"
        )
        session.add(notif)

    session.commit()

    return jsonify({
        "message": f"Ticket #{complaint.ticket_number} status updated to {normalized_status}.",
        "complaint": complaint.to_dict()
    }), 200

@complaints_bp.route("/<complaint_id>/upvote", methods=["POST"])
@login_required
def upvote_complaint(complaint_id):
    session = db_session()
    complaint = session.query(Complaint).filter_by(id=complaint_id).first()
    if not complaint:
        return jsonify({"error": "Complaint not found."}), 404

    complaint.upvotes = (complaint.upvotes or 0) + 1
    session.commit()
    return jsonify({"message": "Upvoted complaint.", "upvotes": complaint.upvotes}), 200

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

# Campus Heatmap Blueprint for Administrators (Faculty/Staff)
admin_bp = Blueprint("admin_complaints", __name__, url_prefix="/api/admin/complaints")

BUILDING_COORDINATES = {
    "bld_eng_1": [12.8235, 80.0445],      # Alan Turing Computer Science Block
    "bld_lib_1": [12.8230, 80.0440],      # Rabindranath Tagore Central Library
    "bld_sports_1": [12.8240, 80.0430],   # Major Dhyan Chand Sports Complex
    "bld_hostel_b": [12.8220, 80.0435],   # Aryabhata Boys Residence Hall
    "bld_hostel_g": [12.8215, 80.0440],   # Kalpana Chawla Girls Residence Hall
    "bld_food_1": [12.8225, 80.0450],     # Campus Student Center & Food Court
}

def get_fallback_coordinates(building_name):
    if not building_name:
        return [12.8230, 80.0440]
    name_lower = building_name.lower()
    if "library" in name_lower or "tagore" in name_lower:
        return [12.8230, 80.0440]
    elif "computer" in name_lower or "turing" in name_lower or "cse" in name_lower or "engineering" in name_lower:
        return [12.8235, 80.0445]
    elif "sports" in name_lower or "gym" in name_lower or "complex" in name_lower or "dhyan" in name_lower:
        return [12.8240, 80.0430]
    elif "boys" in name_lower or "hostel_b" in name_lower or "aryabhata" in name_lower:
        return [12.8220, 80.0435]
    elif "girls" in name_lower or "hostel_g" in name_lower or "kalpana" in name_lower:
        return [12.8215, 80.0440]
    elif "food" in name_lower or "court" in name_lower or "canteen" in name_lower or "center" in name_lower:
        return [12.8225, 80.0450]
    return [12.8230, 80.0440]

@admin_bp.route("/heatmap", methods=["GET"])
@login_required
def get_complaints_heatmap():
    """
    Retrieve active (non-resolved) complaints grouped by location.
    Strictly protected for FACULTY and STAFF roles.
    """
    user_role = g.session.get("role", "STUDENT").upper()
    if user_role not in ("FACULTY", "STAFF"):
        return jsonify({
            "error": "Forbidden: Only faculty members and authorized staff can access admin heatmap data."
        }), 403

    session = db_session()
    # Fetch active complaints (not Resolved)
    active_complaints = session.query(Complaint).filter(Complaint.status != "Resolved").all()

    # Grouping by building ID or building Name
    groups = {}
    for complaint in active_complaints:
        bld_id = complaint.building_id or "unknown"
        bld_name = complaint.building_name or "Unknown Location"
        
        # Standardize building ID if it maps to coordinates
        if bld_id not in BUILDING_COORDINATES:
            # Try to resolve by name matching
            matched_coords = get_fallback_coordinates(bld_name)
            # Create a unique key for grouping
            key = f"descriptive_{bld_name.replace(' ', '_')}"
        else:
            matched_coords = BUILDING_COORDINATES[bld_id]
            key = bld_id
            
        if key not in groups:
            groups[key] = {
                "buildingId": bld_id,
                "locationName": bld_name,
                "position": matched_coords,
                "activeTicketsCount": 0
            }
        groups[key]["activeTicketsCount"] += 1

    return jsonify({"heatmapData": list(groups.values())}), 200

