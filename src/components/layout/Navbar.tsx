import React, { useState } from 'react';
import { Menu, X, Car, User, Shield, Compass, LogOut } from 'lucide-react';
import { Profile, NotificationItem } from '../../types';
import { NotificationBell } from '../notifications/NotificationBell';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  currentUser: Profile;
  notifications: NotificationItem[];
  onOpenCostCalc?: () => void;
  onOpenSafety?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  notifications,
  onOpenCostCalc,
  onOpenSafety,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'find-rides', label: 'Find Rides' },
    { id: 'offer-ride', label: 'Offer a Ride' },
    { id: 'passenger-dashboard', label: 'My Bookings' },
    { id: 'driver-dashboard', label: 'Driver Hub' },
    { id: 'how-it-works', label: 'How It Works' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single clean text element wordmark */}
          <button
            onClick={() => onNavigate('home')}
            className="text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-xs">
              R
            </span>
            <span>RideMate AI</span>
          </button>

          {/* Zone 2: 4-5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
                    isActive ? 'text-emerald-700 font-semibold' : 'text-slate-600'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
            {onOpenCostCalc && (
              <button
                onClick={onOpenCostCalc}
                className="hover:text-slate-900 text-slate-600 transition-colors whitespace-nowrap shrink-0"
              >
                Cost Calculator
              </button>
            )}
            {onOpenSafety && (
              <button
                onClick={onOpenSafety}
                className="hover:text-slate-900 text-slate-600 transition-colors whitespace-nowrap shrink-0"
              >
                Safety & Trust
              </button>
            )}
          </nav>

          {/* Zone 3: 1 primary action & user controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notification Bell */}
            <NotificationBell notifications={notifications} onNavigate={onNavigate} />

            {/* Profile Avatar & Name */}
            <button
              onClick={() => onNavigate('profile')}
              className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left"
              title="View profile & verification status"
            >
              <img
                src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'}
                alt={currentUser.display_name}
                referrerPolicy="no-referrer"
                className="w-6 h-6 rounded-full object-cover border border-slate-200"
              />
              <span className="text-xs font-semibold text-slate-900 max-w-[100px] truncate">
                {currentUser.display_name}
              </span>
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => onNavigate(currentPage === 'offer-ride' ? 'find-rides' : 'offer-ride')}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              {currentPage === 'offer-ride' ? 'Find a Ride' : 'Offer a Ride'}
            </button>

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 text-sm rounded-lg ${
                currentPage === link.id
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}
          {onOpenCostCalc && (
            <button
              onClick={() => {
                onOpenCostCalc();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Cost Calculator
            </button>
          )}
          {onOpenSafety && (
            <button
              onClick={() => {
                onOpenSafety();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Safety & Trust
            </button>
          )}
          <button
            onClick={() => {
              onNavigate('profile');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            My Profile & Vehicle
          </button>
        </div>
      )}
    </header>
  );
};
