import pytest

def test_campus_care_full_lifecycle(client):
    # 1. Login as Student (Ananya)
    login_res = client.post("/api/auth/login", json={
        "email": "ananya@campus.edu",
        "password": "password123",
        "role": "STUDENT"
    })
    assert login_res.status_code == 200
    student_id = login_res.get_json()["user"]["id"]

    # 2. Student submits a new complaint
    create_res = client.post("/api/complaints", json={
        "title": "Mess Food Quality & Cleanliness Concern",
        "description": "The dining hall water filter needs maintenance and tables need regular sanitization.",
        "category": "Mess",
        "buildingName": "Student Center & Dining Hall",
        "roomOrArea": "Mess Hall 1"
    })
    assert create_res.status_code == 201
    created_data = create_res.get_json()["complaint"]
    assert created_data["title"] == "Mess Food Quality & Cleanliness Concern"
    assert created_data["category"] == "Mess"
    assert created_data["status"] == "Submitted"
    assert created_data["student_id"] == student_id
    complaint_id = created_data["id"]

    # 3. Student fetches own complaints via GET /api/complaints/me
    my_complaints_res = client.get("/api/complaints/me")
    assert my_complaints_res.status_code == 200
    my_complaints = my_complaints_res.get_json()["complaints"]
    assert any(c["id"] == complaint_id for c in my_complaints)
    # Ensure every complaint returned belongs to this student
    for c in my_complaints:
        assert c["student_id"] == student_id or c["author_id"] == student_id

    # 4. Student tries to update status (Expect 403 Forbidden)
    unauth_patch = client.patch(f"/api/complaints/{complaint_id}/status", json={
        "status": "In Progress"
    })
    assert unauth_patch.status_code == 403

    # 5. Login as Faculty (Dr. Vikram Sen)
    faculty_login_res = client.post("/api/auth/login", json={
        "email": "prof.vikram@college.edu",
        "password": "password123",
        "role": "FACULTY"
    })
    assert faculty_login_res.status_code == 200

    # 6. Faculty fetches all complaints via GET /api/complaints
    all_complaints_res = client.get("/api/complaints")
    assert all_complaints_res.status_code == 200
    all_complaints = all_complaints_res.get_json()["complaints"]
    assert len(all_complaints) >= 1
    assert any(c["id"] == complaint_id for c in all_complaints)

    # 7. Faculty moves status to 'In Progress'
    patch_in_progress = client.patch(f"/api/complaints/{complaint_id}/status", json={
        "status": "In Progress",
        "note": "Mess supervisor notified. Maintenance team dispatched."
    })
    assert patch_in_progress.status_code == 200
    updated_cmp = patch_in_progress.get_json()["complaint"]
    assert updated_cmp["status"] == "In Progress"

    # 8. Faculty moves status to 'Resolved'
    patch_resolved = client.patch(f"/api/complaints/{complaint_id}/status", json={
        "status": "Resolved",
        "note": "Water filter cartridges replaced and mess hygiene inspected."
    })
    assert patch_resolved.status_code == 200
    resolved_cmp = patch_resolved.get_json()["complaint"]
    assert resolved_cmp["status"] == "Resolved"
