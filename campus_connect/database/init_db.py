from campus_connect.database.session import engine, db_session, Base
from campus_connect.database.models import (
    User, Event, Club, ClubApplicant, ClubAnnouncement, Complaint, ComplaintTimeline,
    Activity, ActivityParticipant, Notice, TeamRequest, TeamMember, ChatMessage, ClubMember
)
from campus_connect.core.auth import hash_password

def init_database():
    """Create all tables and seed with initial dual-profile institutional data"""
    Base.metadata.create_all(bind=engine)
    session = db_session()

    # Ensure new columns/tables exist for SQLite
    try:
        from sqlalchemy import text
        session.execute(text("ALTER TABLE events ADD COLUMN venue VARCHAR(100)"))
        session.commit()
    except Exception:
        session.rollback()

    try:
        from sqlalchemy import text
        session.execute(text("ALTER TABLE events ADD COLUMN capacity INTEGER DEFAULT 150"))
        session.commit()
    except Exception:
        session.rollback()

    # Check if data already seeded
    existing_faculty = session.query(User).filter_by(email="prof.vikram@college.edu").first()
    if existing_faculty:
        session.close()
        return

    print("[INFO] Seeding initial institutional users and campus data...")

    # 1. Create Faculty / Staff User
    faculty_user = User(
        name="Dr. Vikram Sen",
        email="prof.vikram@college.edu",
        password=hash_password("password123"),
        role="FACULTY",
        department="Computer Science & Engineering",
        designation="Professor & Club Faculty Advisor",
        student_or_faculty_id="FAC-CS-104",
        avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        bio="HOD & Professor in AI & Cloud Systems. Faculty advisor for ACM Student Chapter.",
        interests="AI, Cloud Computing, Distributed Systems, Research",
        karma_points=500,
        reliability_score=100,
        is_verified=True,
    )
    session.add(faculty_user)
    session.flush()

    # 2. Create Student User
    student_user = User(
        name="Ananya Sharma",
        email="ananya@campus.edu",
        password=hash_password("password123"),
        role="STUDENT",
        department="Computer Science & Engineering",
        designation="Undergraduate Student (3rd Year)",
        student_or_faculty_id="STU-2024-CS-042",
        avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        bio="Passionate full-stack developer & competitive programmer. Exploring generative AI.",
        interests="AI, Web Development, Football, Hackathons, Cloud",
        karma_points=185,
        reliability_score=96,
        is_verified=True,
    )
    session.add(student_user)
    session.flush()

    # 3. Create Official Events (Authored by Faculty)
    event1 = Event(
        title="National AI & Cloud Hackathon 2026",
        description="Grand 48-hour inter-college AI hackathon with problem statements from top tech companies and cash prizes up to 5 Lakhs.",
        date="Oct 15-17, 2026 • 09:00 AM",
        category="Hackathon",
        location_name="Alan Turing Computer Science Block - Main Auditorium",
        department="Computer Science & Engineering",
        capacity=200,
        banner_image="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80",
        is_official=True,
        author_id=faculty_user.id,
    )
    event2 = Event(
        title="Cloud Native Architecture & Kubernetes Workshop",
        description="Hands-on masterclass on containerization, microservices architecture, and production Kubernetes deployments.",
        date="Nov 05, 2026 • 02:00 PM",
        category="Workshop",
        location_name="Central Library Digital Sandbox Room 204",
        department="Computer Science & Engineering",
        capacity=100,
        banner_image="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
        is_official=True,
        author_id=faculty_user.id,
    )
    event3 = Event(
        title="Annual Tech & Cultural Symphony Fest 'VIBRANCE 2026'",
        description="The largest 3-day campus cultural and technology fest featuring battle of bands, hack competitions, robotics showcase, and live concerts.",
        date="Nov 20-22, 2026 • All Day",
        category="Cultural Fest",
        location_name="Major Dhyan Chand Sports Complex Arena",
        department="Student Affairs",
        capacity=500,
        banner_image="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
        is_official=True,
        author_id=faculty_user.id,
    )
    session.add_all([event1, event2, event3])
    session.flush()

    # Create additional sample student accounts for rich registration analytics
    from campus_connect.database.models import EventRegistration
    extra_students = [
        User(name="Rohan Verma", email="rohan@campus.edu", password=hash_password("password123"), role="STUDENT", department="Electronics & Communication", student_or_faculty_id="STU-2024-EC-102", is_verified=True),
        User(name="Priya Patel", email="priya@campus.edu", password=hash_password("password123"), role="STUDENT", department="Information Technology", student_or_faculty_id="STU-2024-IT-055", is_verified=True),
        User(name="Vikram Malhotra", email="vikram.m@campus.edu", password=hash_password("password123"), role="STUDENT", department="Mechanical Engineering", student_or_faculty_id="STU-2024-ME-089", is_verified=True),
        User(name="Sneha Reddy", email="sneha@campus.edu", password=hash_password("password123"), role="STUDENT", department="Computer Science & Engineering", student_or_faculty_id="STU-2024-CS-112", is_verified=True),
        User(name="Kavya Nair", email="kavya@campus.edu", password=hash_password("password123"), role="STUDENT", department="Electronics & Communication", student_or_faculty_id="STU-2024-EC-204", is_verified=True),
        User(name="Amit Kumar", email="amit@campus.edu", password=hash_password("password123"), role="STUDENT", department="Electrical Engineering", student_or_faculty_id="STU-2024-EE-071", is_verified=True),
    ]
    session.add_all(extra_students)
    session.flush()

    # Seed Event Registrations
    all_seeded_students = [student_user] + extra_students
    for index, student in enumerate(all_seeded_students):
        # Register for event 1
        session.add(EventRegistration(event_id=event1.id, student_id=student.id))
        if index % 2 == 0:
            session.add(EventRegistration(event_id=event2.id, student_id=student.id))
        if index % 3 == 0:
            session.add(EventRegistration(event_id=event3.id, student_id=student.id))

    # 4. Create Clubs & Communities
    club1 = Club(
        name="ACM Student Chapter & Coding Club",
        tag_line="Innovate, Code, and Connect",
        description="Official computer science student chapter organizing competitive coding leagues, open-source hack nights, and tech talks.",
        category="technical",
        faculty_advisor_id=faculty_user.id,
        lead_name="Rahul Verma (4th Year)",
        lead_email="rahul.verma@campus.edu",
        recruitment_open=True,
        recruitment_title="Fall 2026 Core Tech Team Recruitment",
        recruitment_roles="Full Stack Developer, Competitive Programmer, UI Designer",
        recruitment_deadline="Oct 30, 2026",
    )
    club2 = Club(
        name="Robotics & Autonomous Systems Club",
        tag_line="Building Tomorrow's Hardware Today",
        description="Hands-on robotics club building autonomous rovers, drones, and competing in international robotics challenges.",
        category="technical",
        faculty_advisor_id=faculty_user.id,
        lead_name="Pooja Hegde (4th Year)",
        lead_email="pooja.h@campus.edu",
        recruitment_open=True,
        recruitment_title="RoboCon 2027 Team Recruitment",
        recruitment_roles="Embedded Systems Engineer, ROS Developer, Mechanical Designer",
        recruitment_deadline="Nov 10, 2026",
    )
    session.add_all([club1, club2])
    session.flush()

    # 5. Create Club Announcements
    ann1 = ClubAnnouncement(
        club_id=club1.id,
        title="Official Announcement: ACM Winter Hackathon Announced",
        content="Registrations are now open for the internal 24-hour winter hackathon. Faculty mentorship sessions start next Monday.",
        date="Yesterday",
        badge="Official Notice",
        likes=38,
    )
    session.add(ann1)

    # 6. Create Club Applicant (Student Applied)
    applicant1 = ClubApplicant(
        club_id=club1.id,
        user_id=student_user.id,
        user_name=student_user.name,
        user_email=student_user.email,
        user_major="Computer Science & Engineering",
        user_year="3rd Year",
        role_applied="Full Stack Developer",
        why_join="I have built full-stack applications in Python and Next.js and would love to contribute to college portal open-source projects.",
        portfolio_url="https://github.com/ananya-dev",
        status="pending",
    )
    session.add(applicant1)

    # 7. Create Activities (Student Formed)
    activity1 = Activity(
        title="Evening Football 5v5 Friendly Match",
        description="Friendly 5-a-side match on turf. Open for beginners and intermediate players. Need 2 more players to complete squads!",
        category="sports",
        creator_id=student_user.id,
        creator_name=student_user.name,
        creator_avatar=student_user.avatar,
        min_participants=4,
        max_participants=10,
        date="Today",
        time="06:00 PM",
        location_name="Major Dhyan Chand Sports Complex Turf",
        building_id="bld_sports_1",
        coordinates_x=78.0,
        coordinates_y=28.0,
        status="open",
        tags="Football, Sports, Fitness, Casual",
        chat_id="chat_act_001",
    )
    session.add(activity1)
    session.flush()

    participant1 = ActivityParticipant(
        activity_id=activity1.id,
        user_id=student_user.id,
        user_name=student_user.name,
        user_avatar=student_user.avatar,
        role="host",
        joined_at="1 hour ago",
    )
    session.add(participant1)

    # 8. Create Complaints (Campus Care)
    complaint1 = Complaint(
        ticket_number="TKT-2026-8841",
        title="High-Speed Wi-Fi Router Intermittent in CS Lab 304",
        category="Wi-Fi",
        priority="High",
        status="In Progress",
        is_anonymous=False,
        student_id=student_user.id,
        author_id=student_user.id,
        author_name=student_user.name,
        building_id="bld_eng_1",
        building_name="Alan Turing Computer Science Block",
        room_or_area="Lab 304 (AI Sandbox)",
        description="The 5GHz access point in lab 304 frequently disconnects during practical exams and lab sessions.",
        assigned_to="Campus IT & Network Operations",
        assigned_team="Campus IT & Network Operations",
        admin_notes="Technician assigned to inspect switch and replace router firmware.",
        upvotes=14,
        triage_confidence=0.95,
    )
    complaint2 = Complaint(
        ticket_number="TKT-2026-4129",
        title="Water Cooler Filter Replacement Needed in Block B Mess",
        category="Mess",
        priority="Medium",
        status="Submitted",
        is_anonymous=False,
        student_id=student_user.id,
        author_id=student_user.id,
        author_name=student_user.name,
        building_id="bld_food_1",
        building_name="Student Center & Dining Hall",
        room_or_area="Main Dining Mess 2",
        description="The water dispenser filter indicator on 2nd floor mess turned red and water flow is restricted.",
        assigned_to="",
        assigned_team="Campus Facilities Division",
        admin_notes="",
        upvotes=5,
        triage_confidence=0.89,
    )
    complaint3 = Complaint(
        ticket_number="TKT-2026-2301",
        title="Projector HDMI Cable Faulty in Room 102 Lecture Hall",
        category="Infrastructure",
        priority="Low",
        status="Resolved",
        is_anonymous=False,
        student_id=student_user.id,
        author_id=student_user.id,
        author_name=student_user.name,
        building_id="bld_eng_1",
        building_name="Alan Turing Computer Science Block",
        room_or_area="Lecture Hall 102",
        description="HDMI port flickering when connecting laptops during seminar presentations.",
        assigned_to="AV Support Team",
        assigned_team="Campus Facilities Division",
        admin_notes="Replaced with new 4K Gold-plated HDMI Cable and tested with projector.",
        upvotes=8,
        triage_confidence=0.94,
    )
    session.add_all([complaint1, complaint2, complaint3])
    session.flush()

    timeline1 = ComplaintTimeline(
        complaint_id=complaint1.id,
        status="Submitted",
        label="Ticket Submitted",
        timestamp="Yesterday 10:15 AM",
        note="Complaint logged by student.",
        updated_by="System",
    )
    timeline2 = ComplaintTimeline(
        complaint_id=complaint1.id,
        status="In Progress",
        label="Work In Progress",
        timestamp="Today 09:00 AM",
        note="Replacement access point dispatched.",
        updated_by="Campus IT Operations",
    )
    timeline3 = ComplaintTimeline(
        complaint_id=complaint3.id,
        status="Resolved",
        label="Resolved & Verified",
        timestamp="2 days ago",
        note="AV Support technician replaced cabling.",
        updated_by="Facilities Support",
    )
    session.add_all([timeline1, timeline2, timeline3])

    session.commit()
    session.close()
    print("[SUCCESS] Database initialized and seeded successfully!")
