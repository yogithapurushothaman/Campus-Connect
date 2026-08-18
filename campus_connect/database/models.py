import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Integer, Boolean, Float, DateTime, Enum, ForeignKey
)
from sqlalchemy.orm import relationship
from campus_connect.database.session import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class UserRole(str, enum.Enum):
    STUDENT = "STUDENT"
    FACULTY = "FACULTY"
    STAFF = "STAFF"

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    role = Column(String(20), default=UserRole.STUDENT.value, nullable=False)
    department = Column(String(100), default="Computer Science & Engineering")
    designation = Column(String(100), default="Student")
    student_or_faculty_id = Column(String(50), default="")
    avatar = Column(String(255), default="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80")
    bio = Column(Text, default="Passionate member of the campus community.")
    interests = Column(Text, default="AI, Robotics, Web Development, Football")
    karma_points = Column(Integer, default=120)
    reliability_score = Column(Integer, default=95)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    events = relationship("Event", back_populates="author", cascade="all, delete-orphan")
    complaints = relationship("Complaint", foreign_keys="[Complaint.author_id]", back_populates="author")
    club_applications = relationship("ClubApplicant", foreign_keys="[ClubApplicant.user_id]", back_populates="user")

    def to_dict(self):
        role_display = "FACULTY" if self.role in ("FACULTY", "STAFF") else "STUDENT"
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "roleDisplay": role_display,
            "department": self.department,
            "designation": self.designation,
            "studentOrFacultyId": self.student_or_faculty_id,
            "avatar": self.avatar,
            "bio": self.bio,
            "interests": [i.strip() for i in self.interests.split(",") if i.strip()] if self.interests else [],
            "karmaPoints": self.karma_points,
            "reliabilityScore": self.reliability_score,
            "isVerified": self.is_verified,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

class Event(Base):
    __tablename__ = "events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    date = Column(String(100), nullable=False)
    category = Column(String(50), default="Workshop")
    location_name = Column(String(100), default="Main Campus")
    department = Column(String(100), default="General")
    banner_image = Column(String(255), default="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80")
    is_official = Column(Boolean, default=True)
    author_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    author = relationship("User", back_populates="events")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "date": self.date,
            "category": self.category,
            "locationName": self.location_name,
            "department": self.department,
            "bannerImage": self.banner_image,
            "isOfficial": self.is_official,
            "authorId": self.author_id,
            "author": {
                "id": self.author.id,
                "name": self.author.name,
                "email": self.author.email,
                "role": self.author.role,
                "department": self.author.department,
            } if self.author else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

class Club(Base):
    __tablename__ = "clubs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    tag_line = Column(String(200), default="")
    description = Column(Text, default="")
    category = Column(String(50), default="technical")
    logo = Column(String(255), default="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80")
    cover_image = Column(String(255), default="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80")
    member_count = Column(Integer, default=1)
    faculty_advisor_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    lead_name = Column(String(100), default="")
    lead_email = Column(String(255), default="")
    recruitment_open = Column(Boolean, default=True)
    recruitment_title = Column(String(150), default="Fall 2026 Core Team Recruitment")
    recruitment_roles = Column(Text, default="Developer, UI/UX Designer, Event Coordinator")
    recruitment_deadline = Column(String(100), default="Oct 30, 2026")
    created_at = Column(DateTime, default=utc_now)

    # Relationships
    applicants = relationship("ClubApplicant", back_populates="club", cascade="all, delete-orphan")
    announcements = relationship("ClubAnnouncement", back_populates="club", cascade="all, delete-orphan")
    faculty_advisor = relationship("User", foreign_keys=[faculty_advisor_id])

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "tagLine": self.tag_line,
            "description": self.description,
            "category": self.category,
            "logo": self.logo,
            "coverImage": self.cover_image,
            "memberCount": self.member_count,
            "facultyAdvisor": {
                "id": self.faculty_advisor.id,
                "name": self.faculty_advisor.name,
                "email": self.faculty_advisor.email,
            } if self.faculty_advisor else None,
            "leadName": self.lead_name,
            "leadEmail": self.lead_email,
            "recruitment": {
                "isOpen": self.recruitment_open,
                "title": self.recruitment_title,
                "roles": [r.strip() for r in self.recruitment_roles.split(",") if r.strip()],
                "deadline": self.recruitment_deadline,
                "applicants": [a.to_dict() for a in self.applicants]
            },
            "announcements": [an.to_dict() for an in self.announcements]
        }

class ClubApplicant(Base):
    __tablename__ = "club_applicants"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    club_id = Column(String(36), ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user_name = Column(String(100), nullable=False)
    user_email = Column(String(255), nullable=False)
    user_major = Column(String(100), default="Computer Science")
    user_year = Column(String(50), default="3rd Year")
    role_applied = Column(String(100), nullable=False)
    why_join = Column(Text, nullable=False)
    portfolio_url = Column(String(255), default="")
    status = Column(String(30), default="pending")
    approved_by_faculty_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    applied_at = Column(DateTime, default=utc_now)

    # Relationships
    club = relationship("Club", back_populates="applicants")
    user = relationship("User", foreign_keys=[user_id], back_populates="club_applications")

    def to_dict(self):
        return {
            "id": self.id,
            "clubId": self.club_id,
            "clubName": self.club.name if self.club else "",
            "userId": self.user_id,
            "userName": self.user_name,
            "userEmail": self.user_email,
            "userMajor": self.user_major,
            "userYear": self.user_year,
            "roleApplied": self.role_applied,
            "whyJoin": self.why_join,
            "portfolioUrl": self.portfolio_url,
            "status": self.status,
            "appliedAt": self.applied_at.isoformat() if self.applied_at else None,
        }

class ClubAnnouncement(Base):
    __tablename__ = "club_announcements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    club_id = Column(String(36), ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    date = Column(String(100), default="Today")
    badge = Column(String(50), default="Official Notice")
    likes = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)

    # Relationships
    club = relationship("Club", back_populates="announcements")

    def to_dict(self):
        return {
            "id": self.id,
            "clubId": self.club_id,
            "clubName": self.club.name if self.club else "",
            "clubLogo": self.club.logo if self.club else "",
            "title": self.title,
            "content": self.content,
            "date": self.date,
            "badge": self.badge,
            "likes": self.likes,
        }

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    ticket_number = Column(String(50), unique=True, nullable=False)
    title = Column(String(200), nullable=False)
    category = Column(String(50), default="Infrastructure")
    priority = Column(String(30), default="Medium")
    status = Column(String(30), default="Submitted")
    is_anonymous = Column(Boolean, default=False)
    student_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    author_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    author_name = Column(String(100), default="Anonymous Student")
    building_id = Column(String(50), default="bld_eng_1")
    building_name = Column(String(100), default="Engineering Block A")
    room_or_area = Column(String(100), default="Room 304")
    description = Column(Text, nullable=False)
    photo_url = Column(String(255), default="")
    assigned_to = Column(String(100), default="")
    assigned_team = Column(String(100), default="Campus Facilities Division")
    admin_notes = Column(Text, default="")
    resolution_proof_photo = Column(String(255), default="")
    upvotes = Column(Integer, default=1)
    triage_confidence = Column(Float, default=0.92)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    author = relationship("User", foreign_keys=[author_id], back_populates="complaints")
    timeline = relationship("ComplaintTimeline", back_populates="complaint", cascade="all, delete-orphan")

    def to_dict(self):
        # Normalize status display
        raw_status = str(self.status).strip().lower()
        if raw_status in ("submitted", "new", "open"):
            normalized_status = "Submitted"
        elif raw_status in ("in_progress", "in progress", "assigned", "acknowledged"):
            normalized_status = "In Progress"
        elif raw_status in ("resolved", "completed", "closed"):
            normalized_status = "Resolved"
        else:
            normalized_status = self.status.title() if self.status else "Submitted"

        # Normalize category display
        cat_lower = str(self.category).strip().lower()
        if "wifi" in cat_lower or "wi-fi" in cat_lower or "network" in cat_lower or "internet" in cat_lower:
            normalized_category = "Wi-Fi"
        elif "mess" in cat_lower or "food" in cat_lower or "canteen" in cat_lower or "dining" in cat_lower:
            normalized_category = "Mess"
        elif "infra" in cat_lower or "water" in cat_lower or "electric" in cat_lower or "room" in cat_lower or "light" in cat_lower:
            normalized_category = "Infrastructure"
        elif "other" in cat_lower:
            normalized_category = "Other"
        else:
            normalized_category = self.category.title() if self.category else "Other"

        sid = self.student_id or self.author_id

        return {
            "id": self.id,
            "student_id": sid,
            "studentId": sid,
            "ticket_number": self.ticket_number,
            "ticketNumber": self.ticket_number,
            "title": self.title,
            "description": self.description,
            "category": normalized_category,
            "priority": self.priority,
            "status": normalized_status,
            "is_anonymous": self.is_anonymous,
            "isAnonymous": self.is_anonymous,
            "author_id": sid,
            "authorId": sid,
            "author_name": self.author_name if not self.is_anonymous else "Verified Student (Anonymous)",
            "authorName": self.author_name if not self.is_anonymous else "Verified Student (Anonymous)",
            "building_id": self.building_id,
            "buildingId": self.building_id,
            "building_name": self.building_name,
            "buildingName": self.building_name,
            "room_or_area": self.room_or_area,
            "roomOrArea": self.room_or_area,
            "photo_url": self.photo_url,
            "photoUrl": self.photo_url,
            "assigned_to": self.assigned_to,
            "assignedTo": self.assigned_to,
            "assigned_team": self.assigned_team,
            "assignedTeam": self.assigned_team,
            "admin_notes": self.admin_notes,
            "adminNotes": self.admin_notes,
            "resolution_proof_photo": self.resolution_proof_photo,
            "resolutionProofPhoto": self.resolution_proof_photo,
            "upvotes": self.upvotes,
            "triage_confidence": self.triage_confidence,
            "triageConfidence": self.triage_confidence,
            "timeline": [t.to_dict() for t in self.timeline],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }

class ComplaintTimeline(Base):
    __tablename__ = "complaint_timelines"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_id = Column(String(36), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(30), nullable=False)
    label = Column(String(100), nullable=False)
    timestamp = Column(String(100), default="Just now")
    note = Column(Text, default="")
    updated_by = Column(String(100), default="System")

    # Relationships
    complaint = relationship("Complaint", back_populates="timeline")

    def to_dict(self):
        return {
            "id": self.id,
            "status": self.status,
            "label": self.label,
            "timestamp": self.timestamp,
            "note": self.note,
            "updatedBy": self.updated_by,
        }

class Activity(Base):
    __tablename__ = "activities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), default="study")
    creator_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    creator_name = Column(String(100), default="")
    creator_avatar = Column(String(255), default="")
    min_participants = Column(Integer, default=2)
    max_participants = Column(Integer, default=6)
    date = Column(String(100), default="Today")
    time = Column(String(100), default="05:30 PM")
    location_name = Column(String(100), default="Central Library")
    building_id = Column(String(50), default="bld_lib_1")
    coordinates_x = Column(Float, default=50.0)
    coordinates_y = Column(Float, default=50.0)
    status = Column(String(30), default="open")
    tags = Column(Text, default="Study, AI, Group Project")
    chat_id = Column(String(50), default="")
    created_at = Column(DateTime, default=utc_now)

    # Relationships
    participants = relationship("ActivityParticipant", back_populates="activity", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "creatorId": self.creator_id,
            "creatorName": self.creator_name,
            "creatorAvatar": self.creator_avatar,
            "minParticipants": self.min_participants,
            "maxParticipants": self.max_participants,
            "date": self.date,
            "time": self.time,
            "locationName": self.location_name,
            "buildingId": self.building_id,
            "coordinates": {"x": self.coordinates_x, "y": self.coordinates_y},
            "status": self.status,
            "tags": [t.strip() for t in self.tags.split(",") if t.strip()],
            "chatId": self.chat_id,
            "participants": [p.to_dict() for p in self.participants],
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

class ActivityParticipant(Base):
    __tablename__ = "activity_participants"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    activity_id = Column(String(36), ForeignKey("activities.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user_name = Column(String(100), nullable=False)
    user_avatar = Column(String(255), default="")
    role = Column(String(30), default="member")
    joined_at = Column(String(100), default="Just now")

    # Relationships
    activity = relationship("Activity", back_populates="participants")

    def to_dict(self):
        return {
            "userId": self.user_id,
            "userName": self.user_name,
            "userAvatar": self.user_avatar,
            "role": self.role,
            "joinedAt": self.joined_at,
        }

class NotificationItem(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notif_type = Column(String(50), default="general")
    timestamp = Column(String(100), default="Just now")
    is_read = Column(Boolean, default=False)
    link = Column(String(255), default="")
    priority = Column(String(30), default="normal")

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "title": self.title,
            "message": self.message,
            "type": self.notif_type,
            "timestamp": self.timestamp,
            "isRead": self.is_read,
            "link": self.link,
            "priority": self.priority,
        }
