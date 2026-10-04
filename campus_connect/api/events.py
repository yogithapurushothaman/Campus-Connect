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
    scope = request.args.get("scope", "").strip().upper()
    category = request.args.get("category", "").strip()

    session = db_session()
    query = session.query(Event)
    if author_id:
        query = query.filter_by(author_id=author_id)
    if scope in ("INTERNAL", "EXTERNAL"):
        query = query.filter(Event.scope == scope)
    if category:
        query = query.filter(Event.category == category)
    
    events = query.order_by(Event.created_at.desc()).all()
    return jsonify({"events": [e.to_dict() for e in events], "hackathons": [e.to_dict() for e in events]}), 200

@events_bp.route("/hackathons", methods=["GET"])
def get_hackathons_alias():
    return get_events()

@events_bp.route("", methods=["POST"])
@login_required
def create_event():
    user_role = g.session.get("role", "STUDENT").upper()
    user_id = g.session.get("id")
    user_email = g.session.get("email", "").strip().lower()

    session = db_session()
    is_faculty = user_role in ("FACULTY", "STAFF")

    from campus_connect.database.models import Club, ClubDelegation
    delegations = session.query(ClubDelegation).filter(
        (ClubDelegation.student_id == user_id) | (ClubDelegation.student_email.ilike(user_email))
    ).all()
    lead_clubs = session.query(Club).filter(Club.lead_email.ilike(user_email)).all()

    delegated_club_names = [d.club_name for d in delegations] + [c.name for c in lead_clubs]
    is_delegated_student = len(delegated_club_names) > 0

    if not is_faculty and not is_delegated_student:
        return jsonify({
            "error": "Forbidden: Only faculty advisors or delegated student club admins can publish events."
        }), 403

    data = request.get_json() or {}
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    date = data.get("date", "").strip()
    category = data.get("category", "Workshop").strip()
    scope = data.get("scope", "INTERNAL").strip().upper()
    if scope not in ("INTERNAL", "EXTERNAL"):
        scope = "INTERNAL"
    
    club_name = data.get("clubName", "").strip() or data.get("club", "").strip()

    if not is_faculty:
        if scope == "INTERNAL":
            if club_name:
                match = any(cname.lower() in club_name.lower() or club_name.lower() in cname.lower() for cname in delegated_club_names)
                if not match:
                    return jsonify({
                        "error": f"Forbidden: You do not have admin access to publish events for '{club_name}'."
                    }), 403
            else:
                club_name = delegated_club_names[0]
        elif scope == "EXTERNAL":
            if not club_name and delegated_club_names:
                club_name = delegated_club_names[0]

    external_link = data.get("externalLink", "").strip()
    host_institution = data.get("hostInstitution", "").strip()
    
    if scope == "EXTERNAL":
        venue = host_institution or data.get("venue", "External Host").strip()
    else:
        venue = data.get("venue", "").strip() or data.get("locationName", "Main Campus").strip()
        
    department = data.get("department", g.session.get("department", "General")).strip()
    capacity = int(data.get("capacity", 150))
    banner_image = data.get("bannerImage", "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80")

    if not title or not description or not date:
        return jsonify({"error": "Title, description, and date are required."}), 400

    target_club = None
    if club_name:
        target_club = session.query(Club).filter((Club.name.ilike(f"%{club_name}%")) | (Club.id == club_name)).first()

    new_event = Event(
        title=title,
        description=description,
        date=date,
        category=category,
        scope=scope,
        external_link=external_link,
        host_institution=host_institution,
        location_name=venue,
        venue=venue,
        department=department,
        capacity=capacity,
        banner_image=banner_image,
        is_official=True,
        author_id=user_id,
        club_name=target_club.name if target_club else club_name,
        club_id=target_club.id if target_club else None
    )
    session.add(new_event)
    session.commit()

    return jsonify({
        "message": "Event published successfully.",
        "event": new_event.to_dict()
    }), 201

@faculty_events_bp.route("", methods=["POST"])
@login_required
def create_faculty_event():
    return create_event()

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
