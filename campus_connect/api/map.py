from flask import Blueprint, request, jsonify
from campus_connect.core.mock_data import MOCK_CAMPUS_BUILDINGS
from campus_connect.core.ai_helpers import compute_campus_walking_route

map_bp = Blueprint("map", __name__, url_prefix="/api/map")

@map_bp.route("/buildings", methods=["GET"])
def get_buildings():
    return jsonify({"buildings": MOCK_CAMPUS_BUILDINGS}), 200

@map_bp.route("/route", methods=["POST"])
def calculate_route():
    data = request.get_json() or {}
    start_id = data.get("startBuildingId")
    dest_id = data.get("destBuildingId")

    start_bld = next((b for b in MOCK_CAMPUS_BUILDINGS if b["id"] == start_id), None)
    dest_bld = next((b for b in MOCK_CAMPUS_BUILDINGS if b["id"] == dest_id), None)

    if not start_bld or not dest_bld:
        return jsonify({"error": "Start or destination building not found."}), 400

    route_data = compute_campus_walking_route(start_bld, dest_bld)
    return jsonify({"route": route_data}), 200
