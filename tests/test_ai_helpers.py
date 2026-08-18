import pytest
from campus_connect.core.ai_helpers import (
    get_smart_activity_recommendations,
    predict_complaint_attributes,
    find_similar_complaints,
    compute_campus_walking_route
)

def test_activity_recommendations():
    user = {
        "id": "u1",
        "interests": ["Football", "AI", "Cloud"],
        "department": "Computer Science & Engineering",
        "major": "Computer Science & Engineering",
    }

    activities = [
        {
            "id": "a1",
            "title": "Evening Football 5v5",
            "category": "sports",
            "tags": ["Football", "Sports"],
            "status": "open",
            "minParticipants": 4,
            "participants": [{"userId": "u2"}]
        },
        {
            "id": "a2",
            "title": "AI & LLM Hackathon Squad",
            "category": "hackathon",
            "tags": ["AI", "Coding", "Python"],
            "status": "open",
            "minParticipants": 4,
            "participants": [{"userId": "u3"}, {"userId": "u4"}, {"userId": "u5"}]
        },
        {
            "id": "a3",
            "title": "Full Squad Study Group",
            "category": "study",
            "tags": ["Chemistry"],
            "status": "full",
            "minParticipants": 4,
            "participants": []
        }
    ]

    recs = get_smart_activity_recommendations(user, activities)
    assert len(recs) == 2  # 'full' activity filtered out
    # Top recommendation should have high score
    assert recs[0]["score"] >= 80
    assert len(recs[0]["matchReasons"]) > 0

def test_complaint_triage_prediction():
    # Wi-Fi in lab -> urgent priority
    wifi_pred = predict_complaint_attributes("Wi-Fi router down", "Internet connection is dropping in CS lab", "Alan Turing Block")
    assert wifi_pred["predictedCategory"] == "wifi"
    assert wifi_pred["predictedPriority"] == "urgent"
    assert "IT" in wifi_pred["suggestedTeam"]

    # Security test
    sec_pred = predict_complaint_attributes("Dark corridor near east gate", "Street lights not working, need security guard at night", "Campus Perimeter")
    assert sec_pred["predictedCategory"] == "security"
    assert sec_pred["predictedPriority"] == "urgent"

    # Mess food test
    food_pred = predict_complaint_attributes("Mess food quality", "Hygiene in dining hall is poor", "Central Mess")
    assert food_pred["predictedCategory"] == "mess"
    assert "Food" in food_pred["suggestedTeam"]

def test_duplicate_complaint_detection():
    existing = [
        {
            "ticketNumber": "TKT-1001",
            "title": "Water purifier leaking on 3rd floor",
            "description": "Drinking water tap is continuously dripping on 3rd floor",
            "buildingId": "bld_eng_1",
            "status": "submitted"
        },
        {
            "ticketNumber": "TKT-1002",
            "title": "Library air conditioner not cooling",
            "description": "AC unit in 1st floor reading hall is warm",
            "buildingId": "bld_lib_1",
            "status": "submitted"
        }
    ]

    duplicates = find_similar_complaints(
        "Water purifier tap dripping",
        "Water tap is leaking continuously on third floor",
        "bld_eng_1",
        existing
    )
    assert len(duplicates) >= 1
    assert duplicates[0]["complaint"]["ticketNumber"] == "TKT-1001"
    assert duplicates[0]["similarity"] > 50

def test_campus_wayfinding_geometry():
    bld_start = {"name": "Hostel B", "position": {"x": 20, "y": 70}}
    bld_dest = {"name": "Central Library", "position": {"x": 50, "y": 50}}

    route = compute_campus_walking_route(bld_start, bld_dest)
    assert route["distanceMeters"] > 0
    assert route["durationMinutes"] >= 1
    assert len(route["waypoints"]) == 5
    assert len(route["steps"]) == 5
    assert "Hostel B" in route["steps"][0]
    assert "Central Library" in route["steps"][-1]
