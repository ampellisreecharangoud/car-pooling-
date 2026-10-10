/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { store } from './lib/store';
import { Ride, Profile, SearchCriteria } from './types';
import { JudgeToolbar } from './components/layout/JudgeToolbar';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { FindRidesPage } from './pages/FindRidesPage';
import { OfferRidePage } from './pages/OfferRidePage';
import { DriverDashboard } from './pages/DriverDashboard';
import { PassengerDashboard } from './pages/PassengerDashboard';
import { ProfilePage } from './pages/ProfilePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { SafetyPage } from './pages/SafetyPage';
import { CostCalculatorModal } from './components/matching/CostCalculatorModal';
import { SafetyModal } from './components/safety/SafetyModal';
import { RequestBookingModal } from './components/matching/RequestBookingModal';
import { ReportModal } from './components/safety/ReportModal';
import { DriverVerificationModal } from './components/verification/DriverVerificationModal';
import { AdminVerificationQueueModal } from './components/verification/AdminVerificationQueueModal';

export default function App() {
  const [, setTick] = useState(0);

  // App Navigation State
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | undefined>(undefined);

  // Modal States
  const [isCostCalcOpen, setIsCostCalcOpen] = useState(false);
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);
  const [isDriverVerificationOpen, setIsDriverVerificationOpen] = useState(false);
  const [isAdminQueueOpen, setIsAdminQueueOpen] = useState(false);
  const [selectedRideForBooking, setSelectedRideForBooking] = useState<Ride | null>(null);
  const [reportTarget, setReportTarget] = useState<{
    userId: string;
    userName: string;
    rideId?: string;
  } | null>(null);

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  const currentUser = store.getCurrentUser();
  const rides = store.getRides();
  const notifications = store.getNotifications(currentUser.id);

  const handleHeroSearch = (criteria: SearchCriteria) => {
    setSearchCriteria(criteria);
    setCurrentPage('find-rides');
  };

  const handleRequestBooking = (ride: Ride) => {
    setSelectedRideForBooking(ride);
  };

  const handleOpenReport = (userId: string, userName: string, rideId?: string) => {
    setReportTarget({ userId, userName, rideId });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Hackathon Judge Sandbox Switcher */}
      <JudgeToolbar
        currentUser={currentUser}
        onNavigate={setCurrentPage}
        onOpenAdminQueue={() => setIsAdminQueueOpen(true)}
        onOpenDriverVerification={() => setIsDriverVerificationOpen(true)}
      />

      {/* Main Top Bar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        currentUser={currentUser}
        notifications={notifications}
        onOpenCostCalc={() => setIsCostCalcOpen(true)}
        onOpenSafety={() => setIsSafetyOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onSearch={handleHeroSearch}
            onNavigate={setCurrentPage}
            onOpenCostCalc={() => setIsCostCalcOpen(true)}
            onOpenSafety={() => setIsSafetyOpen(true)}
          />
        )}

        {currentPage === 'find-rides' && (
          <FindRidesPage
            rides={rides}
            currentUser={currentUser}
            initialCriteria={searchCriteria}
            onRequestBooking={handleRequestBooking}
            onOpenReport={handleOpenReport}
          />
        )}

        {currentPage === 'offer-ride' && (
          <OfferRidePage
            currentUser={currentUser}
            onNavigate={setCurrentPage}
            onOpenCostCalc={() => setIsCostCalcOpen(true)}
            onOpenVerification={() => setIsDriverVerificationOpen(true)}
          />
        )}

        {currentPage === 'driver-dashboard' && (
          <DriverDashboard
            currentUser={currentUser}
            onNavigate={setCurrentPage}
            onOpenReport={handleOpenReport}
            onOpenVerification={() => setIsDriverVerificationOpen(true)}
          />
        )}

        {currentPage === 'passenger-dashboard' && (
          <PassengerDashboard
            currentUser={currentUser}
            onNavigate={setCurrentPage}
            onOpenReport={handleOpenReport}
          />
        )}

        {currentPage === 'profile' && (
          <ProfilePage
            currentUser={currentUser}
            onOpenVerification={() => setIsDriverVerificationOpen(true)}
          />
        )}

        {currentPage === 'how-it-works' && (
          <HowItWorksPage
            onNavigate={setCurrentPage}
            onOpenCostCalc={() => setIsCostCalcOpen(true)}
          />
        )}

        {currentPage === 'safety' && (
          <SafetyPage
            onOpenSafetyModal={() => setIsSafetyOpen(true)}
            onOpenReport={() =>
              handleOpenReport('user-driver-alex', 'Alex Rivera', 'ride-101')
            }
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={setCurrentPage}
        onOpenSafety={() => setIsSafetyOpen(true)}
        onOpenCostCalc={() => setIsCostCalcOpen(true)}
      />

      {/* Fair Cost-Sharing Calculator Modal */}
      <CostCalculatorModal
        isOpen={isCostCalcOpen}
        onClose={() => setIsCostCalcOpen(false)}
      />

      {/* Safety & Trust Modal */}
      <SafetyModal
        isOpen={isSafetyOpen}
        onClose={() => setIsSafetyOpen(false)}
      />

      {/* Request Booking Modal */}
      <RequestBookingModal
        ride={selectedRideForBooking}
        currentUser={currentUser}
        isOpen={Boolean(selectedRideForBooking)}
        onClose={() => setSelectedRideForBooking(null)}
        onSuccess={() => {
          setCurrentPage('passenger-dashboard');
        }}
      />

      {/* Report Incident Modal */}
      {reportTarget && (
        <ReportModal
          isOpen={Boolean(reportTarget)}
          onClose={() => setReportTarget(null)}
          reportedUserId={reportTarget.userId}
          reportedUserName={reportTarget.userName}
          rideId={reportTarget.rideId}
        />
      )}

      {/* Driver Verification Modal (Driver submits license, vehicle, insurance) */}
      <DriverVerificationModal
        currentUser={currentUser}
        isOpen={isDriverVerificationOpen}
        onClose={() => setIsDriverVerificationOpen(false)}
      />

      {/* Admin Verification Queue Console (Campus Transport reviews & approves) */}
      <AdminVerificationQueueModal
        isOpen={isAdminQueueOpen}
        onClose={() => setIsAdminQueueOpen(false)}
      />
    </div>
  );
}
