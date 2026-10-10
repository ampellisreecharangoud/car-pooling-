import React from 'react';
import { Shield, Heart, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
  onOpenSafety?: () => void;
  onOpenCostCalc?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenSafety, onOpenCostCalc }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Wordmark & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                R
              </span>
              <span className="text-white font-bold text-base tracking-tight">RideMate AI</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Smart carpooling platform for university students, campus faculty, and daily commuters. One route. Shared rides. Smarter journeys.
            </p>
            <div className="text-[11px] text-slate-500">
              Developed for College Hackathon Mobility Innovation.
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3">Explore</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('find-rides')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Find a Ride
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('offer-ride')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Offer Empty Seats
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenCostCalc}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Fair Cost-Sharing Calculator
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Safety & Policies */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3">Trust & Safety</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenSafety}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Community Safety Guidelines
                </button>
              </li>
              <li>
                <span className="text-slate-500">Driver Verification Protocol</span>
              </li>
              <li>
                <span className="text-slate-500">Non-Profit Cost Recovery Policy</span>
              </li>
              <li>
                <span className="text-slate-500">Privacy & Coordinate Masking</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Hackathon Architecture */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3">Architecture Stack</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li>• Frontend: React 19 + TypeScript + Vite</li>
              <li>• Styling: Tailwind CSS & Lucide Icons</li>
              <li>• Engine: Supabase / PostgreSQL RLS</li>
              <li>• Maps: Leaflet OpenStreetMap</li>
              <li>• Concurrency: Atomic DB Row Locks</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; 2026 RideMate AI. All rights reserved. Peer-to-peer carpooling coordination.
          </div>
          <div className="flex items-center gap-4">
            <span>Terms of Service</span>
            <span>·</span>
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Campus Security Hotline: (555) 019-SAFE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
