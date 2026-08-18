import pytest

def test_club_application_and_advisor_approval(client):
    # 1. Login as Student
    client.post("/api/auth/login", json={
        "email": "ananya@campus.edu",
        "password": "password123",
        "role": "STUDENT"
    })

    # Fetch clubs
    clubs_res = client.get("/api/clubs")
    assert clubs_res.status_code == 200
    clubs = clubs_res.get_json()["clubs"]
    assert len(clubs) > 0
    club_id = clubs[0]["id"]

    # Student applies to club
    apply_res = client.post(f"/api/clubs/{club_id}/apply", json={
        "roleApplied": "Core Developer",
        "whyJoin": "Passionate about full stack development.",
        "portfolioUrl": "https://github.com/test-student"
    })
    assert apply_res.status_code == 201
    applicant_id = apply_res.get_json()["applicant"]["id"]

    # Student attempts to approve application (Expect 403 Forbidden)
    student_approve_res = client.patch(f"/api/clubs/{club_id}/applicants/{applicant_id}", json={
        "status": "accepted"
    })
    assert student_approve_res.status_code == 403

    # 2. Login as Faculty Advisor
    client.post("/api/auth/login", json={
        "email": "prof.vikram@college.edu",
        "password": "password123",
        "role": "FACULTY"
    })

    # Faculty approves application
    faculty_approve_res = client.patch(f"/api/clubs/{club_id}/applicants/{applicant_id}", json={
        "status": "accepted"
    })
    assert faculty_approve_res.status_code == 200
    assert faculty_approve_res.get_json()["applicant"]["status"] == "accepted"

def test_complaint_triage_and_resolution(client):
    # 1. Login as Student
    client.post("/api/auth/login", json={
        "email": "ananya@campus.edu",
        "password": "password123",
        "role": "STUDENT"
    })

    # Student submits Wi-Fi issue
    submit_res = client.post("/api/complaints", json={
        "title": "Wi-Fi access point not connecting in Library 2nd Floor",
        "description": "Signal drops constantly during exam prep hours.",
        "buildingId": "bld_lib_1",
        "buildingName": "Rabindranath Tagore Central Library",
        "roomOrArea": "2nd Floor Quiet Study"
    })
    assert submit_res.status_code == 201
    complaint = submit_res.get_json()["complaint"]
    assert complaint["category"] == "wifi"
    assert complaint["priority"] in ("high", "urgent")
    complaint_id = complaint["id"]

    # Student attempts to resolve complaint (Expect 403 Forbidden)
    student_resolve_res = client.patch(f"/api/complaints/{complaint_id}/status", json={
        "status": "resolved"
    })
    assert student_resolve_res.status_code == 403

    # 2. Login as Faculty / Staff
    client.post("/api/auth/login", json={
        "email": "prof.vikram@college.edu",
        "password": "password123",
        "role": "FACULTY"
    })

    # Faculty resolves complaint
    faculty_resolve_res = client.patch(f"/api/complaints/{complaint_id}/status", json={
        "status": "resolved",
        "note": "Replaced secondary router with 6GHz dual-band access point."
    })
    assert faculty_resolve_res.status_code == 200
    assert faculty_resolve_res.get_json()["complaint"]["status"] == "resolved"

def test_campus_wayfinding_route(client):
    route_res = client.post("/api/map/route", json={
        "startBuildingId": "bld_hostel_b",
        "destBuildingId": "bld_eng_1"
    })
    assert route_res.status_code == 200
    route_data = route_res.get_json()["route"]
    assert route_data["distanceMeters"] > 0
    assert route_data["durationMinutes"] >= 1
    assert len(route_data["waypoints"]) == 5
    assert len(route_data["steps"]) >= 4
