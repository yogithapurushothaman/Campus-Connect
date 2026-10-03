from flask import Blueprint, request, jsonify, g
from campus_connect.database.session import db_session
from campus_connect.database.models import ContentReport, TeamRequest, ClubAnnouncement
from campus_connect.core.middleware import login_required

reports_bp = Blueprint("reports", __name__, url_prefix="/api/reports")
admin_reports_bp = Blueprint("admin_reports", __name__, url_prefix="/api/admin/reports")

@reports_bp.route("", methods=["POST"])
@login_required
def submit_report():
    """
    Submit a report against a piece of content (TeamRequest or ClubAnnouncement).
    """
    data = request.get_json() or {}
    content_type = data.get("contentType", data.get("content_type", "")).strip()
    content_id = data.get("contentId", data.get("content_id", "")).strip()
    reason = data.get("reason", "").strip()

    if not content_type or not content_id or not reason:
        return jsonify({"error": "Content type, content ID, and reason are required."}), 400

    if content_type not in ("team_request", "club_update"):
        return jsonify({"error": "Invalid content type. Must be 'team_request' or 'club_update'."}), 400

    session = db_session()
    
    # Verify content actually exists
    if content_type == "team_request":
        exists = session.query(TeamRequest).filter_by(id=content_id).first() is not None
    else:
        exists = session.query(ClubAnnouncement).filter_by(id=content_id).first() is not None

    if not exists:
        return jsonify({"error": "Offending content not found."}), 404

    report = ContentReport(
        reporter_id=g.session["id"],
        content_type=content_type,
        content_id=content_id,
        reason=reason,
        status="pending"
    )
    session.add(report)
    session.commit()

    return jsonify({"message": "Content reported successfully.", "report": report.to_dict()}), 201

@admin_reports_bp.route("", methods=["GET"])
@login_required
def get_moderation_queue():
    """
    Fetch all pending moderation reports.
    Restricted to FACULTY or STAFF roles.
    """
    user_role = g.session.get("role", "STUDENT").upper()
    if user_role not in ("FACULTY", "STAFF"):
        return jsonify({"error": "Forbidden: Moderation privileges required."}), 403

    session = db_session()
    reports = (
        session.query(ContentReport)
        .filter_by(status="pending")
        .order_by(ContentReport.created_at.desc())
        .all()
    )
    return jsonify({"reports": [r.to_dict() for r in reports]}), 200

@admin_reports_bp.route("/<report_id>", methods=["PATCH"])
@login_required
def handle_report(report_id):
    """
    Handle a moderation report. Action can be 'dismiss' or 'takedown'.
    Restricted to FACULTY or STAFF roles.
    """
    user_role = g.session.get("role", "STUDENT").upper()
    if user_role not in ("FACULTY", "STAFF"):
        return jsonify({"error": "Forbidden: Moderation privileges required."}), 403

    data = request.get_json() or {}
    action = data.get("action", "").strip().lower()

    if action not in ("dismiss", "takedown"):
        return jsonify({"error": "Invalid action. Must be 'dismiss' or 'takedown'."}), 400

    session = db_session()
    report = session.query(ContentReport).filter_by(id=report_id).first()
    if not report:
        return jsonify({"error": "Report not found."}), 404

    if action == "dismiss":
        report.status = "resolved"
        session.commit()
        return jsonify({"message": "Report dismissed.", "report": report.to_dict()}), 200

    elif action == "takedown":
        # Delete offending content
        if report.content_type == "team_request":
            content = session.query(TeamRequest).filter_by(id=report.content_id).first()
            if content:
                session.delete(content)
        elif report.content_type == "club_update":
            content = session.query(ClubAnnouncement).filter_by(id=report.content_id).first()
            if content:
                session.delete(content)

        # Resolve all pending reports targeting this exact content
        session.query(ContentReport).filter_by(content_id=report.content_id).update({"status": "resolved"})
        session.commit()
        return jsonify({"message": "Content taken down and associated reports resolved."}), 200
