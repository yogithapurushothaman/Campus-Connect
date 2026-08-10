'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Activity,
  ChatMessage,
  CampusEvent,
  Club,
  Complaint,
  CampusBuilding,
  NotificationItem,
  EmergencyAlert,
  ComplaintStatus,
} from '../types';
import {
  mockUsers,
  mockCampusBuildings,
  mockActivities,
  mockChatMessages,
  mockEvents,
  mockClubs,
  mockComplaints,
  mockNotifications,
  mockEmergencyAlert,
} from '../lib/mockData';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  // User & Roles
  currentUser: User;
  allUsers: User[];
  switchUser: (userId: string) => void;
  switchUserRole: (role: UserRole) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  verifyStudentEmail: (otp: string) => boolean;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Activities
  activities: Activity[];
  createActivity: (newAct: Omit<Activity, 'id' | 'creatorId' | 'creatorName' | 'creatorAvatar' | 'participants' | 'chatId' | 'createdAt'>) => Activity;
  joinActivity: (activityId: string) => void;
  leaveActivity: (activityId: string) => void;
  activeSquadChatActivity: Activity | null;
  setActiveSquadChatActivity: (act: Activity | null) => void;

  // Chat
  chatMessages: Record<string, ChatMessage[]>;
  sendMessage: (chatId: string, content: string, type?: 'text' | 'location' | 'rsvp', metadata?: any) => void;

  // Events
  events: CampusEvent[];
  rsvpEvent: (eventId: string) => void;
  bookmarkEvent: (eventId: string) => void;
  createEvent: (newEvent: Omit<CampusEvent, 'id' | 'rsvpCount' | 'rsvpUserIds' | 'bookmarkedUserIds'>) => CampusEvent;

  // Clubs
  clubs: Club[];
  joinClub: (clubId: string) => void;
  leaveClub: (clubId: string) => void;
  postClubAnnouncement: (clubId: string, title: string, content: string, badge?: string) => void;
  applyToClub: (clubId: string, roleApplied: string, whyJoin: string, portfolioUrl?: string) => void;
  updateApplicantStatus: (clubId: string, applicantId: string, status: 'pending' | 'shortlisted' | 'rejected' | 'accepted') => void;

  // Campus Care Complaints
  complaints: Complaint[];
  submitComplaint: (complaintData: Omit<Complaint, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'timeline' | 'upvotes' | 'upvotedByUserIds' | 'status'>) => Complaint;
  upvoteComplaint: (complaintId: string) => void;
  updateComplaintStatus: (complaintId: string, newStatus: ComplaintStatus, note?: string, assignedTo?: string, assignedTeam?: string) => void;
  addAdminNote: (complaintId: string, note: string) => void;

  // Campus Map & Wayfinding
  buildings: CampusBuilding[];
  selectedBuilding: CampusBuilding | null;
  setSelectedBuilding: (bldg: CampusBuilding | null) => void;
  mapRoute: { start: CampusBuilding; dest: CampusBuilding } | null;
  setMapRoute: (route: { start: CampusBuilding; dest: CampusBuilding } | null) => void;
  navigateToVenue: (buildingId: string) => void;

  // Notifications & Alerts
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  emergencyAlert: EmergencyAlert | null;
  broadcastEmergencyAlert: (title: string, description: string, level: 'advisory' | 'warning' | 'critical', instructions: string[]) => void;
  dismissEmergencyAlert: () => void;

  // Toast System
  toasts: Toast[];
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State initialization with localStorage fallback
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);
  const [allUsers, setAllUsers] = useState<User[]>(mockUsers);
  const [activeTab, setActiveTab] = useState<string>('activities');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [activeSquadChatActivity, setActiveSquadChatActivity] = useState<Activity | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(mockChatMessages);

  const [events, setEvents] = useState<CampusEvent[]>(mockEvents);
  const [clubs, setClubs] = useState<Club[]>(mockClubs);
  const [complaints, setComplaints] = useState<Complaint[]>(mockComplaints);

  const [buildings] = useState<CampusBuilding[]>(mockCampusBuildings);
  const [selectedBuilding, setSelectedBuilding] = useState<CampusBuilding | null>(mockCampusBuildings[0]);
  const [mapRoute, setMapRoute] = useState<{ start: CampusBuilding; dest: CampusBuilding } | null>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [emergencyAlert, setEmergencyAlert] = useState<EmergencyAlert | null>(mockEmergencyAlert);

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('cc_current_user');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));

      const savedActivities = localStorage.getItem('cc_activities');
      if (savedActivities) setActivities(JSON.parse(savedActivities));

      const savedComplaints = localStorage.getItem('cc_complaints');
      if (savedComplaints) setComplaints(JSON.parse(savedComplaints));

      const savedEvents = localStorage.getItem('cc_events');
      if (savedEvents) setEvents(JSON.parse(savedEvents));

      const savedClubs = localStorage.getItem('cc_clubs');
      if (savedClubs) setClubs(JSON.parse(savedClubs));

      const savedMessages = localStorage.getItem('cc_chat_messages');
      if (savedMessages) setChatMessages(JSON.parse(savedMessages));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  // Save changes
  useEffect(() => {
    try {
      localStorage.setItem('cc_current_user', JSON.stringify(currentUser));
      localStorage.setItem('cc_activities', JSON.stringify(activities));
      localStorage.setItem('cc_complaints', JSON.stringify(complaints));
      localStorage.setItem('cc_events', JSON.stringify(events));
      localStorage.setItem('cc_clubs', JSON.stringify(clubs));
      localStorage.setItem('cc_chat_messages', JSON.stringify(chatMessages));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [currentUser, activities, complaints, events, clubs, chatMessages]);

  const showToast = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // User management
  const switchUser = (userId: string) => {
    const found = allUsers.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      showToast('Switched Persona', `Now logged in as ${found.name} (${found.role.replace('_', ' ').toUpperCase()})`, 'info');
    }
  };

  const switchUserRole = (role: UserRole) => {
    const updated = { ...currentUser, role };
    setCurrentUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    showToast('Role Switched', `Active view updated to ${role.replace('_', ' ').toUpperCase()}`, 'success');
  };

  const updateUserProfile = (updates: Partial<User>) => {
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    showToast('Profile Updated', 'Your profile information has been saved.', 'success');
  };

  const verifyStudentEmail = (otp: string) => {
    if (otp === '123456' || otp.length === 6) {
      const updated = { ...currentUser, isVerified: true, reliabilityScore: Math.max(currentUser.reliabilityScore, 95) };
      setCurrentUser(updated);
      setAllUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
      showToast('Verification Successful! 🎉', 'College email verified. Full campus access granted.', 'success');
      return true;
    }
    showToast('Invalid OTP', 'Please enter the correct 6-digit verification code.', 'error');
    return false;
  };

  // Activities & Squad Chat
  const createActivity = (newActData: Omit<Activity, 'id' | 'creatorId' | 'creatorName' | 'creatorAvatar' | 'participants' | 'chatId' | 'createdAt'>) => {
    const id = `act-${Date.now()}`;
    const chatId = `chat-${id}`;
    const newActivity: Activity = {
      ...newActData,
      id,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      creatorAvatar: currentUser.avatar,
      participants: [
        {
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          role: 'host',
          joinedAt: 'Just now',
          attendanceConfirmed: true,
        },
      ],
      chatId,
      createdAt: new Date().toISOString(),
      status: 'open',
    };

    // Auto-create initial chat message
    const initialMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      chatId,
      senderId: 'system',
      senderName: 'CampusConnect Bot',
      senderAvatar: '/bot.png',
      content: `🎉 Squad created by ${currentUser.name}! Dedicated group chat is now open for coordination.`,
      timestamp: 'Just now',
      type: 'system',
    };

    setActivities((prev) => [newActivity, ...prev]);
    setChatMessages((prev) => ({ ...prev, [chatId]: [initialMessage] }));
    showToast('Activity Created! 🚀', `Squad "${newActivity.title}" is live and open for students!`, 'success');
    return newActivity;
  };

  const joinActivity = (activityId: string) => {
    setActivities((prev) =>
      prev.map((act) => {
        if (act.id === activityId) {
          if (act.participants.some((p) => p.userId === currentUser.id)) {
            showToast('Already Joined', 'You are already a member of this squad.', 'info');
            return act;
          }
          if (act.participants.length >= act.maxParticipants) {
            showToast('Squad Full', 'This activity has reached maximum capacity.', 'warning');
            return act;
          }

          const updatedParticipants = [
            ...act.participants,
            {
              userId: currentUser.id,
              userName: currentUser.name,
              userAvatar: currentUser.avatar,
              role: 'member' as const,
              joinedAt: 'Just now',
              attendanceConfirmed: true,
            },
          ];

          const isNowFull = updatedParticipants.length >= act.maxParticipants;

          // Add system message in chat
          sendMessage(
            act.chatId,
            `👋 ${currentUser.name} joined the squad! (${updatedParticipants.length}/${act.maxParticipants} slots filled)`,
            'system'
          );

          showToast('Squad Joined! 🎉', `You joined "${act.title}". Dedicated group chat unlocked!`, 'success');

          return {
            ...act,
            participants: updatedParticipants,
            status: isNowFull ? 'full' : act.status,
          };
        }
        return act;
      })
    );
  };

  const leaveActivity = (activityId: string) => {
    setActivities((prev) =>
      prev.map((act) => {
        if (act.id === activityId) {
          const updatedParticipants = act.participants.filter((p) => p.userId !== currentUser.id);
          sendMessage(act.chatId, `🚪 ${currentUser.name} left the squad.`, 'system');
          showToast('Left Squad', `You left "${act.title}".`, 'info');
          return {
            ...act,
            participants: updatedParticipants,
            status: act.status === 'full' ? 'open' : act.status,
          };
        }
        return act;
      })
    );
  };

  const sendMessage = (chatId: string, content: string, type: 'text' | 'location' | 'rsvp' | 'system' = 'text', metadata?: any) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      chatId,
      senderId: type === 'system' ? 'system' : currentUser.id,
      senderName: type === 'system' ? 'CampusConnect Bot' : currentUser.name,
      senderAvatar: type === 'system' ? '/bot.png' : currentUser.avatar,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      metadata,
    };

    setChatMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMessage],
    }));
  };

  // Events
  const rsvpEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === eventId) {
          const alreadyRSVPed = evt.rsvpUserIds.includes(currentUser.id);
          const updatedUserIds = alreadyRSVPed
            ? evt.rsvpUserIds.filter((id) => id !== currentUser.id)
            : [...evt.rsvpUserIds, currentUser.id];

          showToast(
            alreadyRSVPed ? 'RSVP Cancelled' : 'RSVP Confirmed! 🎉',
            alreadyRSVPed ? `You cancelled your RSVP for ${evt.title}` : `You are going to ${evt.title}! Added to reminders.`,
            alreadyRSVPed ? 'info' : 'success'
          );

          return {
            ...evt,
            rsvpUserIds: updatedUserIds,
            rsvpCount: updatedUserIds.length,
          };
        }
        return evt;
      })
    );
  };

  const bookmarkEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === eventId) {
          const alreadyBookmarked = evt.bookmarkedUserIds.includes(currentUser.id);
          const updatedUserIds = alreadyBookmarked
            ? evt.bookmarkedUserIds.filter((id) => id !== currentUser.id)
            : [...evt.bookmarkedUserIds, currentUser.id];

          showToast(
            alreadyBookmarked ? 'Bookmark Removed' : 'Event Bookmarked 🔖',
            alreadyBookmarked ? 'Removed from saved items' : 'Saved to your bookmarked opportunities',
            'info'
          );

          return {
            ...evt,
            bookmarkedUserIds: updatedUserIds,
          };
        }
        return evt;
      })
    );
  };

  const createEvent = (newEventData: Omit<CampusEvent, 'id' | 'rsvpCount' | 'rsvpUserIds' | 'bookmarkedUserIds'>) => {
    const id = `evt-${Date.now()}`;
    const newEvent: CampusEvent = {
      ...newEventData,
      id,
      rsvpCount: 1,
      rsvpUserIds: [currentUser.id],
      bookmarkedUserIds: [],
    };
    setEvents((prev) => [newEvent, ...prev]);
    showToast('Event Published! 📢', `"${newEvent.title}" is now visible to all students.`, 'success');
    return newEvent;
  };

  // Clubs
  const joinClub = (clubId: string) => {
    setClubs((prev) =>
      prev.map((c) => {
        if (c.id === clubId) {
          if (c.members.some((m) => m.userId === currentUser.id)) {
            showToast('Already a Member', `You are already part of ${c.name}`, 'info');
            return c;
          }
          const updatedMembers = [
            ...c.members,
            { userId: currentUser.id, userName: currentUser.name, role: 'member' as const, joinedAt: 'Just now' },
          ];
          showToast('Joined Club! 🌟', `Welcome to ${c.name}!`, 'success');
          return {
            ...c,
            memberCount: updatedMembers.length,
            members: updatedMembers,
          };
        }
        return c;
      })
    );

    const updatedUserClubs = Array.from(new Set([...currentUser.joinedClubIds, clubId]));
    updateUserProfile({ joinedClubIds: updatedUserClubs });
  };

  const leaveClub = (clubId: string) => {
    setClubs((prev) =>
      prev.map((c) => {
        if (c.id === clubId) {
          const updatedMembers = c.members.filter((m) => m.userId !== currentUser.id);
          showToast('Left Club', `You left ${c.name}`, 'info');
          return {
            ...c,
            memberCount: updatedMembers.length,
            members: updatedMembers,
          };
        }
        return c;
      })
    );

    const updatedUserClubs = currentUser.joinedClubIds.filter((id) => id !== clubId);
    updateUserProfile({ joinedClubIds: updatedUserClubs });
  };

  const postClubAnnouncement = (clubId: string, title: string, content: string, badge?: string) => {
    const targetClub = clubs.find((c) => c.id === clubId);
    if (!targetClub) return;

    const newAnnouncement = {
      id: `ann-${Date.now()}`,
      clubId,
      clubName: targetClub.name,
      clubLogo: targetClub.logo,
      title,
      content,
      date: 'Just now',
      likes: 0,
      likedByUserIds: [],
      badge,
    };

    setClubs((prev) =>
      prev.map((c) => (c.id === clubId ? { ...c, announcements: [newAnnouncement, ...c.announcements] } : c))
    );

    showToast('Announcement Published 📢', `Broadcasted to ${targetClub.memberCount} members.`, 'success');
  };

  const applyToClub = (clubId: string, roleApplied: string, whyJoin: string, portfolioUrl?: string) => {
    const targetClub = clubs.find((c) => c.id === clubId);
    if (!targetClub) return;

    const newApplicant = {
      id: `app-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userMajor: currentUser.major,
      userYear: currentUser.year,
      roleApplied,
      whyJoin,
      portfolioUrl,
      status: 'pending' as const,
      appliedAt: 'Just now',
    };

    setClubs((prev) =>
      prev.map((c) =>
        c.id === clubId
          ? {
              ...c,
              recruitment: {
                ...c.recruitment,
                applicants: [newApplicant, ...(c.recruitment?.applicants || [])],
              },
            }
          : c
      )
    );

    showToast('Application Submitted! 📄', `Applied for ${roleApplied} role at ${targetClub.name}`, 'success');
  };

  const updateApplicantStatus = (
    clubId: string,
    applicantId: string,
    status: 'pending' | 'shortlisted' | 'rejected' | 'accepted'
  ) => {
    setClubs((prev) =>
      prev.map((c) => {
        if (c.id === clubId && c.recruitment) {
          const updatedApplicants = c.recruitment.applicants.map((a) =>
            a.id === applicantId ? { ...a, status } : a
          );
          return {
            ...c,
            recruitment: {
              ...c.recruitment,
              applicants: updatedApplicants,
            },
          };
        }
        return c;
      })
    );
    showToast('Candidate Updated', `Applicant status marked as ${status.toUpperCase()}`, 'info');
  };

  // Campus Care Complaints
  const submitComplaint = (
    complaintData: Omit<Complaint, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'timeline' | 'upvotes' | 'upvotedByUserIds' | 'status'>
  ) => {
    const ticketNumber = `CC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = `cmp-${Date.now()}`;
    const timestamp = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

    const newComplaint: Complaint = {
      ...complaintData,
      id,
      ticketNumber,
      status: 'submitted',
      createdAt: timestamp,
      updatedAt: timestamp,
      upvotes: 1,
      upvotedByUserIds: [currentUser.id],
      timeline: [
        {
          status: 'submitted',
          label: 'Complaint Submitted',
          timestamp,
          note: complaintData.isAnonymous ? 'Submitted anonymously for privacy protection.' : 'Logged by student.',
          updatedBy: complaintData.isAnonymous ? 'Anonymous' : currentUser.name,
        },
      ],
    };

    setComplaints((prev) => [newComplaint, ...prev]);
    showToast('Complaint Logged ⚡', `Ticket #${ticketNumber} created. SLA tracking initialized.`, 'success');
    return newComplaint;
  };

  const upvoteComplaint = (complaintId: string) => {
    setComplaints((prev) =>
      prev.map((cmp) => {
        if (cmp.id === complaintId) {
          const hasUpvoted = cmp.upvotedByUserIds.includes(currentUser.id);
          const updatedUpvotes = hasUpvoted
            ? cmp.upvotedByUserIds.filter((id) => id !== currentUser.id)
            : [...cmp.upvotedByUserIds, currentUser.id];

          showToast(
            hasUpvoted ? 'Upvote Removed' : 'Issue Upvoted 👍',
            hasUpvoted ? 'Removed priority vote' : 'Added your vote to boost admin visibility',
            'info'
          );

          return {
            ...cmp,
            upvotes: updatedUpvotes.length,
            upvotedByUserIds: updatedUpvotes,
          };
        }
        return cmp;
      })
    );
  };

  const updateComplaintStatus = (
    complaintId: string,
    newStatus: ComplaintStatus,
    note?: string,
    assignedTo?: string,
    assignedTeam?: string
  ) => {
    const timestamp = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

    setComplaints((prev) =>
      prev.map((cmp) => {
        if (cmp.id === complaintId) {
          const statusLabels: Record<ComplaintStatus, string> = {
            submitted: 'Submitted',
            acknowledged: 'Acknowledged by Desk',
            assigned: `Assigned to ${assignedTo || 'Specialist Team'}`,
            in_progress: 'Resolution In Progress',
            resolved: 'Resolved & Verified',
          };

          const newTimelineItem = {
            status: newStatus,
            label: statusLabels[newStatus] || newStatus,
            timestamp,
            note: note || `Status transitioned to ${newStatus.toUpperCase()}`,
            updatedBy: currentUser.name,
          };

          showToast('Ticket Lifecycle Updated 🛠️', `Ticket #${cmp.ticketNumber} marked as ${newStatus.toUpperCase()}`, 'success');

          return {
            ...cmp,
            status: newStatus,
            updatedAt: timestamp,
            assignedTo: assignedTo || cmp.assignedTo,
            assignedTeam: assignedTeam || cmp.assignedTeam,
            timeline: [...cmp.timeline, newTimelineItem],
          };
        }
        return cmp;
      })
    );
  };

  const addAdminNote = (complaintId: string, note: string) => {
    setComplaints((prev) =>
      prev.map((cmp) => (cmp.id === complaintId ? { ...cmp, adminNotes: note } : cmp))
    );
    showToast('Admin Note Saved', 'Internal note added to ticket log.', 'info');
  };

  // Map & Wayfinding
  const navigateToVenue = (buildingId: string) => {
    const target = buildings.find((b) => b.id === buildingId);
    if (target) {
      setSelectedBuilding(target);
      // Default start from Student Hostel Block A
      const hostel = buildings.find((b) => b.id === 'bldg-7') || buildings[0];
      setMapRoute({ start: hostel, dest: target });
      setActiveTab('map');
      showToast('Navigating to Venue 🧭', `Showing walking route to ${target.name}`, 'info');
    }
  };

  // Notifications & Emergency
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('All Read', 'Notification center cleared.', 'info');
  };

  const broadcastEmergencyAlert = (
    title: string,
    description: string,
    level: 'advisory' | 'warning' | 'critical',
    instructions: string[]
  ) => {
    const newAlert: EmergencyAlert = {
      id: `alert-${Date.now()}`,
      title,
      description,
      level,
      issuedBy: `${currentUser.name} (${currentUser.major})`,
      issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isActive: true,
      instructions,
    };
    setEmergencyAlert(newAlert);
    showToast('EMERGENCY BROADCAST ISSUED 🚨', title, 'warning');
  };

  const dismissEmergencyAlert = () => {
    if (emergencyAlert) {
      setEmergencyAlert({ ...emergencyAlert, isActive: false });
      showToast('Alert Dismissed', 'Emergency banner minimized.', 'info');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        switchUser,
        switchUserRole,
        updateUserProfile,
        verifyStudentEmail,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        activities,
        createActivity,
        joinActivity,
        leaveActivity,
        activeSquadChatActivity,
        setActiveSquadChatActivity,
        chatMessages,
        sendMessage,
        events,
        rsvpEvent,
        bookmarkEvent,
        createEvent,
        clubs,
        joinClub,
        leaveClub,
        postClubAnnouncement,
        applyToClub,
        updateApplicantStatus,
        complaints,
        submitComplaint,
        upvoteComplaint,
        updateComplaintStatus,
        addAdminNote,
        buildings,
        selectedBuilding,
        setSelectedBuilding,
        mapRoute,
        setMapRoute,
        navigateToVenue,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        emergencyAlert,
        broadcastEmergencyAlert,
        dismissEmergencyAlert,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
