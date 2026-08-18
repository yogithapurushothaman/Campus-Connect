from flask import Blueprint, request, jsonify, g
from campus_connect.database.session import db_session
from campus_connect.database.models import Activity, Complaint, User
from campus_connect.core.ai_helpers import (
    get_smart_activity_recommendations,
    predict_complaint_attributes,
    find_similar_complaints
)
from campus_connect.core.middleware import login_required

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")

@ai_bp.route("/predict-complaint", methods=["POST"])
def predict_complaint():
    data = request.get_json() or {}
    title = data.get("title", "")
    description = data.get("description", "")
    building_name = data.get("buildingName", "")

    prediction = predict_complaint_attributes(title, description, building_name)
    return jsonify({"prediction": prediction}), 200

@ai_bp.route("/recommend-activities", methods=["GET", "POST"])
@login_required
def recommend_activities():
    session = db_session()
    user = session.query(User).filter_by(id=g.session["id"]).first()
    if not user:
        return jsonify({"recommendations": []}), 200

    activities = session.query(Activity).filter_by(status="open").all()
    act_dicts = [a.to_dict() for a in activities]
    recommendations = get_smart_activity_recommendations(user.to_dict(), act_dicts)

    return jsonify({"recommendations": recommendations}), 200

@ai_bp.route("/check-duplicates", methods=["POST"])
def check_duplicates():
    data = request.get_json() or {}
    title = data.get("title", "")
    description = data.get("description", "")
    building_id = data.get("buildingId", "")

    session = db_session()
    complaints = session.query(Complaint).all()
    cmp_dicts = [c.to_dict() for c in complaints]
    similar = find_similar_complaints(title, description, building_id, cmp_dicts)

    return jsonify({"similarComplaints": similar}), 200
