from flask import Blueprint, request, jsonify, g
from campus_connect.database.session import db_session
from campus_connect.database.models import Club, ClubApplicant, ClubAnnouncement, ClubMember
from campus_connect.core.middleware import login_required

clubs_bp = Blueprint("clubs", __name__, url_prefix="/api/clubs")

@clubs_bp.route("", methods=["GET"])
def get_clubs():
    session = db_session()
    clubs = session.query(Club).order_by(Club.name.asc()).all()
    return jsonify({"clubs": [c.to_dict() for c in clubs]}), 200

@clubs_bp.route("/<club_id>/apply", methods=["POST"])
@login_required
def apply_to_club(club_id):
    session = db_session()
    club = session.query(Club).filter_by(id=club_id).first()
    if not club:
        return jsonify({"error": "Club not found."}), 404

    data = request.get_json() or {}
    role_applied = data.get("roleApplied", "Core Team Member").strip()
    why_join = data.get("whyJoin", "").strip()
    portfolio_url = data.get("portfolioUrl", "").strip()

    if not why_join:
        return jsonify({"error": "Please provide a reason why you would like to join."}), 400

    applicant = ClubApplicant(
        club_id=club_id,
        user_id=g.session["id"],
        user_name=g.session.get("name", "Student"),
        user_email=g.session.get("email", ""),
        user_major=g.session.get("department", "Computer Science"),
        user_year="3rd Year",
        role_applied=role_applied,
        why_join=why_join,
        portfolio_url=portfolio_url,
        status="pending",
    )
    session.add(applicant)
    session.commit()

    return jsonify({
        "message": "Application submitted to Club Faculty Advisor for review!",
        "applicant": applicant.to_dict()
    }), 201

@clubs_bp.route("/<club_id>/applicants/<applicant_id>", methods=["PATCH"])
@login_required
def update_applicant_status(club_id, applicant_id):
    # RBAC: Only Faculty Advisors & Staff can approve club applications
    user_role = g.session.get("role", "STUDENT").upper()
    if user_role not in ("FACULTY", "STAFF"):
        return jsonify({
            "error": "Forbidden: Only faculty advisors and authorized staff can approve or review club applications."
        }), 403

    data = request.get_json() or {}
    new_status = data.get("status", "").strip().lower()
    if new_status not in ("pending", "shortlisted", "accepted", "rejected"):
        return jsonify({"error": "Invalid status value."}), 400

    session = db_session()
    applicant = session.query(ClubApplicant).filter_by(id=applicant_id, club_id=club_id).first()
    if not applicant:
        return jsonify({"error": "Applicant record not found."}), 404

    applicant.status = new_status
    applicant.approved_by_faculty_id = g.session["id"]
    session.commit()

    return jsonify({
        "message": f"Applicant status updated to {new_status.capitalize()}.",
        "applicant": applicant.to_dict()
    }), 200

@clubs_bp.route("/<club_id>/announcements", methods=["POST"])
@login_required
def post_announcement(club_id):
    # RBAC: Faculty / Advisor required
    user_role = g.session.get("role", "STUDENT").upper()
    if user_role not in ("FACULTY", "STAFF"):
        return jsonify({
            "error": "Forbidden: Only faculty advisors and club leaders can publish official announcements."
        }), 403

    data = request.get_json() or {}
    title = data.get("title", "").strip()
    content = data.get("content", "").strip()
    badge = data.get("badge", "Official Notice").strip()

    if not title or not content:
        return jsonify({"error": "Title and content are required."}), 400

    session = db_session()
    announcement = ClubAnnouncement(
        club_id=club_id,
        title=title,
        content=content,
        date="Today",
        badge=badge,
        likes=0
    )
    session.add(announcement)
    session.commit()

    return jsonify({
        "message": "Announcement published successfully.",
        "announcement": announcement.to_dict()
    }), 201

@clubs_bp.route("", methods=["POST"])
@login_required
def create_club():
    # Only Faculty/Staff can create clubs
    user_role = g.session.get("role", "STUDENT").upper()
    if user_role not in ("FACULTY", "STAFF"):
        return jsonify({"error": "Forbidden: Only faculty or staff can create clubs."}), 403

    data = request.get_json() or {}
    name = data.get("name", "").strip()
    description = data.get("description", "").strip()
    category = data.get("category", "Technical").strip()
    tag_line = data.get("tagLine", "").strip()

    if not name or not description:
        return jsonify({"error": "Name and description are required."}), 400

    session = db_session()
    club = Club(
        name=name,
        description=description,
        category=category,
        tag_line=tag_line,
        member_count=0
    )
    session.add(club)
    session.commit()

    return jsonify({"message": "Club created successfully!", "club": club.to_dict()}), 201

@clubs_bp.route("/<club_id>", methods=["GET"])
@login_required
def get_club_by_id(club_id):
    session = db_session()
    club = session.query(Club).filter_by(id=club_id).first()
    if not club:
        return jsonify({"error": "Club not found."}), 404
    return jsonify({"club": club.to_dict()}), 200

@clubs_bp.route("/<club_id>/join", methods=["POST"])
@login_required
def toggle_club_membership(club_id):
    session = db_session()
    club = session.query(Club).filter_by(id=club_id).first()
    if not club:
        return jsonify({"error": "Club not found."}), 404

    existing = session.query(ClubMember).filter_by(
        club_id=club_id,
        student_id=g.session["id"]
    ).first()

    if existing:
        # Remove membership (Leave)
        session.delete(existing)
        club.member_count = max(0, (club.member_count or 0) - 1)
        session.commit()
        return jsonify({
            "message": "Left club successfully.",
            "isMember": False,
            "club": club.to_dict()
        }), 200
    else:
        # Add membership (Join)
        new_member = ClubMember(
            club_id=club_id,
            student_id=g.session["id"],
            role="member"
        )
        session.add(new_member)
        club.member_count = (club.member_count or 0) + 1
        session.commit()
        return jsonify({
            "message": "Joined club successfully!",
            "isMember": True,
            "club": club.to_dict()
        }), 200

@clubs_bp.route("/grant-club-access", methods=["POST"])
@clubs_bp.route("/faculty/grant-club-access", methods=["POST"])
@login_required
def grant_club_access():
    user_role = g.session.get("role", "STUDENT").upper()
    if user_role not in ("FACULTY", "STAFF"):
        return jsonify({"error": "Forbidden: Only faculty advisors can grant club admin access."}), 403

    data = request.get_json() or {}
    student_email = data.get("studentEmail", "").strip() or data.get("email", "").strip()
    club_name = data.get("clubName", "").strip() or data.get("club", "").strip()
    role = data.get("role", "Event Coordinator").strip() or data.get("clubRole", "Event Coordinator").strip()

    if not student_email or not club_name or not role:
        return jsonify({"error": "Student email, club name, and role are required."}), 400

    from campus_connect.database.models import User
    session = db_session()
    student = session.query(User).filter_by(email=student_email).first()
    if not student:
        return jsonify({"error": f"Student with email '{student_email}' was not found in the campus directory."}), 404

    club = session.query(Club).filter((Club.id == club_name) | (Club.name.ilike(f"%{club_name}%"))).first()
    target_club_name = club.name if club else club_name

    if club and role.lower() in ("president", "lead", "club lead"):
        club.lead_email = student.email
        club.lead_name = student.name
    
    session.commit()

    return jsonify({
        "message": f"Access granted. {student_email} is now recognized as {role} of {target_club_name}.",
        "student": student.to_dict(),
        "role": role,
        "clubName": target_club_name
    }), 200

