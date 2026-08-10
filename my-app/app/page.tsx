'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { MobileNav } from '../components/MobileNav';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { ToastContainer } from '../components/ToastContainer';

// Feature Views
import { ActivityFeed } from '../components/activities/ActivityFeed';
import { EventHub } from '../components/events/EventHub';
import { ClubsDirectory } from '../components/clubs/ClubsDirectory';
import { CampusMapViewer } from '../components/map/CampusMapViewer';
import { ComplaintList } from '../components/campuscare/ComplaintList';
import { AdminComplaintDashboard } from '../components/campuscare/AdminComplaintDashboard';
import { ProfileView } from '../components/profile/ProfileView';

export default function CampusConnectApp() {
  const { activeTab } = useApp();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'activities':
        return <ActivityFeed />;
      case 'events':
        return <EventHub />;
      case 'clubs':
        return <ClubsDirectory />;
      case 'map':
        return <CampusMapViewer />;
      case 'campuscare':
        return <ComplaintList />;
      case 'admin':
        return <AdminComplaintDashboard />;
      case 'profile':
        return <ProfileView />;
      default:
        return <ActivityFeed />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EE] text-[#1E202A] selection:bg-indigo-500 selection:text-white">
      {/* Emergency Alert Priority Banner */}
      <EmergencyBanner />

      {/* Main Top Header */}
      <Navbar onMobileMenuToggle={() => setIsMobileNavOpen(true)} />

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Center Stage Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Navigation Slide-over Drawer */}
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

      {/* Floating Interactive Toast Feedback System */}
      <ToastContainer />
    </div>
  );
}
