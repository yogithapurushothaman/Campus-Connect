import pytest
import time

def test_rbac_and_event_lifecycle(client):
    """
    Comprehensive 8-step RBAC and event feed integration test suite
    mirroring test-rbac.mjs in Python with full feature parity.
    """

    # ----------------------------------------------------
    # Test 1: Register Staff / Faculty User
    # ----------------------------------------------------
    ts = int(time.time() * 1000)
    staff_email = f"prof.vikram.{ts}@college.edu"
    staff_signup_res = client.post("/api/auth/signup", json={
        "name": "Dr. Vikram Sen",
        "email": staff_email,
        "password": "password123",
        "role": "FACULTY",
        "department": "Computer Science & Engineering",
        "designation": "Professor & Club Advisor",
        "studentOrFacultyId": f"FAC-{ts}"
    })

    assert staff_signup_res.status_code == 201
    staff_data = staff_signup_res.get_json()
    assert staff_data["user"]["role"] == "FACULTY"
    assert staff_data["user"]["email"] == staff_email

    # ----------------------------------------------------
    # Test 2: Faculty Creates Official Campus Event
    # ----------------------------------------------------
    event_res = client.post("/api/events", json={
        "title": "National AI & Cloud Hackathon 2026",
        "description": "Grand 48-hour inter-college AI hackathon with prizes up to 5 Lakhs.",
        "date": "Oct 15-17, 2026 • 09:00 AM",
        "category": "Hackathon",
        "locationName": "Alan Turing Computer Science Block",
        "department": "Computer Science & Engineering"
    })

    assert event_res.status_code == 201
    event_data = event_res.get_json()
    assert event_data["event"]["title"] == "National AI & Cloud Hackathon 2026"
    assert event_data["event"]["author"]["name"] == "Dr. Vikram Sen"

    # ----------------------------------------------------
    # Test 3: Register Student User
    # ----------------------------------------------------
    student_email = f"ananya.{ts}@campus.edu"
    student_signup_res = client.post("/api/auth/signup", json={
        "name": "Ananya Sharma",
        "email": student_email,
        "password": "password123",
        "role": "STUDENT",
        "department": "Computer Science & Engineering",
        "designation": "Student (3rd Year)",
        "studentOrFacultyId": f"STU-{ts}"
    })

    assert student_signup_res.status_code == 201
    student_data = student_signup_res.get_json()
    assert student_data["user"]["role"] == "STUDENT"
    assert student_data["user"]["email"] == student_email

    # ----------------------------------------------------
    # Test 4: Student Attempts Event Creation (Strict 403 Forbidden)
    # ----------------------------------------------------
    unauthorized_res = client.post("/api/events", json={
        "title": "Unauthorized Student Party",
        "description": "Students should not be allowed to post official events.",
        "date": "Tonight",
    })

    assert unauthorized_res.status_code == 403
    unauth_data = unauthorized_res.get_json()
    assert "Forbidden" in unauth_data["error"]

    # ----------------------------------------------------
    # Test 5: Student Fetches Event Feed
    # ----------------------------------------------------
    feed_res = client.get("/api/events")
    assert feed_res.status_code == 200
    feed_data = feed_res.get_json()
    assert len(feed_data["events"]) >= 1

    created_event = next(
        (e for e in feed_data["events"] if e["title"] == "National AI & Cloud Hackathon 2026"),
        None
    )
    assert created_event is not None
    assert created_event["author"]["name"] == "Dr. Vikram Sen"

    # ----------------------------------------------------
    # Test 6: Faculty Login
    # ----------------------------------------------------
    faculty_login_res = client.post("/api/auth/login", json={
        "email": staff_email,
        "password": "password123",
        "role": "FACULTY"
    })
    assert faculty_login_res.status_code == 200
    faculty_login_data = faculty_login_res.get_json()
    assert faculty_login_data["redirectTo"] in ("/dashboard", "/faculty-dashboard")

    # ----------------------------------------------------
    # Test 7: Student Login
    # ----------------------------------------------------
    student_login_res = client.post("/api/auth/login", json={
        "email": student_email,
        "password": "password123",
        "role": "STUDENT"
    })
    assert student_login_res.status_code == 200
    student_login_data = student_login_res.get_json()
    assert student_login_data["redirectTo"] in ("/dashboard", "/student-dashboard")

    # ----------------------------------------------------
    # Test 8: Student Cross-Role Login Attempt (Strict 403 Forbidden)
    # ----------------------------------------------------
    cross_role_res = client.post("/api/auth/login", json={
        "email": student_email,
        "password": "password123",
        "role": "FACULTY"
    })
    assert cross_role_res.status_code == 403
    cross_role_data = cross_role_res.get_json()
    assert "Faculty login" in cross_role_data["error"] or "Student login" in cross_role_data["error"] or "registered as a Student" in cross_role_data["error"]
