import csv
import io
from flask import Blueprint, request, jsonify, g, Response
from campus_connect.database.session import db_session
from campus_connect.database.models import Event, EventRSVP, EventRegistration, User
from campus_connect.core.middleware import login_required

events_bp = Blueprint("events", __name__, url_prefix="/api/events")
faculty_events_bp = Blueprint("faculty_events", __name__, url_prefix="/api/faculty/events")

@events_bp.route("", methods=["GET"])
def get_events():
    author_id = request.args.get("authorId")
    session = db_session()
    query = session.query(Event)
    if author_id:
        query = query.filter_by(author_id=author_id)
    
    events = query.order_by(Event.created_at.desc()).all()
    return jsonify({"events": [e.to_dict() for e in events]}), 200

@events_bp.route("", methods=["POST"])
@login_required
def create_event():
    user_role = g.session.get("role", "STUDENT").upper()
    if user_role not in ("FACULTY", "STAFF"):
        return jsonify({
            "error": "Forbidden: Only faculty and staff members are authorized to create official campus events."
        }), 403

    data = request.get_json() or {}
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    date = data.get("date", "").strip()
    category = data.get("category", "Workshop").strip()
    venue = data.get("venue", "").strip() or data.get("locationName", "Main Campus").strip()
    department = data.get("department", g.session.get("department", "General")).strip()
    capacity = int(data.get("capacity", 150))
    banner_image = data.get("bannerImage", "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80")

    if not title or not description or not date:
        return jsonify({"error": "Title, description, and date are required."}), 400

    session = db_session()
    new_event = Event(
        title=title,
        description=description,
        date=date,
        category=category,
        location_name=venue,
        venue=venue,
        department=department,
        capacity=capacity,
        banner_image=banner_image,
        is_official=True,
        author_id=g.session["id"]
    )
    session.add(new_event)
    session.commit()

    return jsonify({
        "message": "Event published successfully.",
        "event": new_event.to_dict()
    }), 201

@events_bp.route("/<event_id>/rsvp", methods=["POST"])
@login_required
def rsvp_event(event_id):
    session = db_session()
    event = session.query(Event).filter_by(id=event_id).first()
    if not event:
        return jsonify({"error": "Event not found"}), 404

    user_id = g.session["id"]
    existing_rsvp = session.query(EventRSVP).filter_by(user_id=user_id, event_id=event_id).first()
    existing_reg = session.query(EventRegistration).filter_by(student_id=user_id, event_id=event_id).first()

    if existing_rsvp or existing_reg:
        return jsonify({"message": "Already RSVP'd to this event", "status": "exists"}), 200

    new_rsvp = EventRSVP(user_id=user_id, event_id=event_id)
    session.add(new_rsvp)

    new_reg = EventRegistration(student_id=user_id, event_id=event_id)
    session.add(new_reg)

    session.commit()

    return jsonify({"message": "RSVP confirmed successfully.", "status": "created"}), 201


def get_event_registrations_internal(event_id):
    session = db_session()
    event = session.query(Event).filter_by(id=event_id).first()
    if not event:
        return jsonify({"error": "Event not found"}), 404

    registrations = session.query(EventRegistration).filter_by(event_id=event_id).all()
    
    # Fallback/sync with EventRSVP table for complete data
    if not registrations:
        rsvps = session.query(EventRSVP).filter_by(event_id=event_id).all()
        for rsvp in rsvps:
            reg = EventRegistration(student_id=rsvp.user_id, event_id=event_id)
            session.add(reg)
        session.commit()
        registrations = session.query(EventRegistration).filter_by(event_id=event_id).all()

    reg_list = [r.to_dict() for r in registrations]

    # Calculate Department Breakdown
    dept_breakdown = {}
    for r in reg_list:
        dept = r.get("student", {}).get("department", "Computer Science & Engineering") if r.get("student") else "Computer Science & Engineering"
        dept_breakdown[dept] = dept_breakdown.get(dept, 0) + 1

    return jsonify({
        "eventId": event.id,
        "eventTitle": event.title,
        "capacity": event.capacity or 150,
        "registration_count": len(reg_list),
        "registrationCount": len(reg_list),
        "department_breakdown": dept_breakdown,
        "departmentBreakdown": dept_breakdown,
        "registrations": reg_list,
        "registered_students": reg_list
    }), 200


def export_event_csv_internal(event_id):
    session = db_session()
    event = session.query(Event).filter_by(id=event_id).first()
    if not event:
        return jsonify({"error": "Event not found"}), 404

    registrations = session.query(EventRegistration).filter_by(event_id=event_id).all()
    if not registrations:
        rsvps = session.query(EventRSVP).filter_by(event_id=event_id).all()
        for rsvp in rsvps:
            reg = EventRegistration(student_id=rsvp.user_id, event_id=event_id)
            session.add(reg)
        session.commit()
        registrations = session.query(EventRegistration).filter_by(event_id=event_id).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Registration ID", "Student Name", "Register Number", "Department", "Student Email", "Registered At"])

    for r in registrations:
        std = r.student
        name = std.name if std else "Student"
        reg_no = std.student_or_faculty_id if (std and std.student_or_faculty_id) else "RA2111003010042"
        dept = std.department if (std and std.department) else "Computer Science & Engineering"
        email = std.email if std else "student@campus.edu"
        reg_time = r.registered_at.strftime("%Y-%m-%d %H:%M:%S") if r.registered_at else "N/A"
        writer.writerow([r.id, name, reg_no, dept, email, reg_time])

    csv_data = output.getvalue()
    filename = f"event_roster_{event.id[:8]}.csv"
    
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@events_bp.route("/<event_id>/registrations", methods=["GET"])
@login_required
def get_event_registrations(event_id):
    return get_event_registrations_internal(event_id)


@events_bp.route("/<event_id>/export", methods=["GET"])
@login_required
def export_event_csv(event_id):
    return export_event_csv_internal(event_id)


@faculty_events_bp.route("/<event_id>/registrations", methods=["GET"])
@login_required
def faculty_get_event_registrations(event_id):
    return get_event_registrations_internal(event_id)


@faculty_events_bp.route("/<event_id>/export", methods=["GET"])
@login_required
def faculty_export_event_csv(event_id):
    return export_event_csv_internal(event_id)
