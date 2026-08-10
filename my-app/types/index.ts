export type UserRole = 'student' | 'club_admin' | 'campus_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  studentId: string;
  major: string;
  year: string;
  isVerified: boolean;
  reliabilityScore: number; // 0 - 100%
  activitiesAttended: number;
  activitiesJoined: number;
  badges: { id: string; name: string; icon: string; description: string }[];
  bio: string;
  interests: string[];
  role: UserRole;
  privacySettings: {
    showEmail: boolean;
    showYear: boolean;
    allowDirectInvites: boolean;
  };
  karmaPoints: number;
  joinedClubIds: string[];
}

export type ActivityCategory = 'sports' | 'study' | 'hackathon' | 'gaming' | 'workshop' | 'other';
export type ActivityStatus = 'open' | 'full' | 'in_progress' | 'completed' | 'cancelled';

export interface ActivityParticipant {
  userId: string;
  userName: string;
  userAvatar: string;
  role: 'host' | 'member';
  joinedAt: string;
  attendanceConfirmed?: boolean;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  minParticipants: number;
  maxParticipants: number;
  participants: ActivityParticipant[];
  date: string;
  time: string;
  locationName: string;
  buildingId: string;
  coordinates: { x: number; y: number };
  status: ActivityStatus;
  tags: string[];
  chatId: string;
  createdAt: string;
  requiredSkillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'all';
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  type: 'text' | 'location' | 'system' | 'rsvp';
  metadata?: {
    locationName?: string;
    coordinates?: { x: number; y: number };
    rsvpStatus?: 'going' | 'declined';
  };
}

export type EventCategory = 'workshop' | 'hackathon' | 'fest' | 'internship' | 'scholarship' | 'recruitment' | 'seminar';

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  organizer: string;
  clubId?: string;
  category: EventCategory;
  bannerImage: string;
  date: string;
  time: string;
  locationName: string;
  buildingId: string;
  coordinates: { x: number; y: number };
  rsvpCount: number;
  rsvpUserIds: string[];
  bookmarkedUserIds: string[];
  tags: string[];
  isFeatured?: boolean;
  externalLink?: string;
  deadline?: string;
  capacity?: number;
}

export type ClubCategory = 'technical' | 'cultural' | 'sports' | 'academic' | 'social';

export interface ClubAnnouncement {
  id: string;
  clubId: string;
  clubName: string;
  clubLogo: string;
  title: string;
  content: string;
  date: string;
  likes: number;
  likedByUserIds: string[];
  badge?: string;
}

export interface ClubApplicant {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userMajor: string;
  userYear: string;
  roleApplied: string;
  whyJoin: string;
  portfolioUrl?: string;
  status: 'pending' | 'shortlisted' | 'rejected' | 'accepted';
  appliedAt: string;
}

export interface ClubRecruitment {
  isOpen: boolean;
  title: string;
  roles: string[];
  deadline: string;
  applicants: ClubApplicant[];
}

export interface Club {
  id: string;
  name: string;
  tagLine: string;
  description: string;
  category: ClubCategory;
  logo: string;
  coverImage: string;
  memberCount: number;
  leadName: string;
  leadEmail: string;
  members: { userId: string; userName: string; role: 'member' | 'lead' | 'core'; joinedAt: string }[];
  announcements: ClubAnnouncement[];
  recruitment: ClubRecruitment;
}

export type ComplaintCategory = 'infrastructure' | 'hostel' | 'mess' | 'academic' | 'wifi' | 'security' | 'lab' | 'other';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ComplaintStatus = 'submitted' | 'acknowledged' | 'assigned' | 'in_progress' | 'resolved';

export interface ComplaintTimelineItem {
  status: ComplaintStatus;
  label: string;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface Complaint {
  id: string;
  ticketNumber: string;
  title: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  isAnonymous: boolean;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  buildingId: string;
  buildingName: string;
  roomOrArea: string;
  description: string;
  photoUrl?: string;
  assignedTo?: string;
  assignedTeam?: string;
  createdAt: string;
  updatedAt: string;
  estimatedResolution: string;
  timeline: ComplaintTimelineItem[];
  upvotes: number;
  upvotedByUserIds: string[];
  resolutionProofPhoto?: string;
  adminNotes?: string;
}

export interface CampusBuilding {
  id: string;
  name: string;
  code: string;
  category: 'academic' | 'hostel' | 'lab' | 'sports' | 'food' | 'library' | 'admin' | 'medical';
  position: { x: number; y: number }; // Percentage 0-100 on map canvas
  size: { width: number; height: number };
  floors: number;
  description: string;
  image: string;
  rooms: { name: string; floor: number; category: string }[];
  amenities: string[];
  wifiRating: number; // 1-5
  openHours: string;
  activeComplaintsCount: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'activity' | 'chat' | 'event' | 'club' | 'complaint' | 'emergency';
  timestamp: string;
  isRead: boolean;
  link?: string;
  priority?: 'normal' | 'high' | 'critical';
}

export interface EmergencyAlert {
  id: string;
  title: string;
  description: string;
  level: 'advisory' | 'warning' | 'critical';
  issuedBy: string;
  issuedAt: string;
  isActive: boolean;
  instructions: string[];
}
