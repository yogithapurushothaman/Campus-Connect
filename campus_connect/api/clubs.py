from flask import Blueprint, request, jsonify, g
from campus_connect.database.session import db_session
from campus_connect.database.models import Club, ClubApplicant, ClubAnnouncement
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
