from flask import Blueprint, request, jsonify, g
from campus_connect.database.session import db_session
from campus_connect.database.models import Notification
from campus_connect.core.middleware import login_required

notifications_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")

@notifications_bp.route("", methods=["GET"])
@login_required
def get_notifications():
    """
    Fetch all notifications for the authenticated user, sorted by newest first.
    """
    current_user_id = g.session.get("id")
    session = db_session()
    notifications = (
        session.query(Notification)
        .filter_by(user_id=current_user_id)
        .order_by(Notification.created_at.desc())
        .all()
    )
    return jsonify({"notifications": [n.to_dict() for n in notifications]}), 200

@notifications_bp.route("/<notification_id>/read", methods=["PATCH"])
@login_required
def mark_notification_as_read(notification_id):
    """
    Mark a specific notification for the current user as read.
    """
    current_user_id = g.session.get("id")
    session = db_session()
    
    notification = (
        session.query(Notification)
        .filter_by(id=notification_id, user_id=current_user_id)
        .first()
    )
    
    if not notification:
        return jsonify({"error": "Notification not found or access forbidden."}), 404
        
    notification.is_read = True
    session.commit()
    
    return jsonify({
        "message": "Notification marked as read successfully.",
        "notification": notification.to_dict()
    }), 200
