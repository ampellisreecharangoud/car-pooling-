import React, { useState } from 'react';
import { UserCheck, RefreshCw, Zap, ShieldCheck, Database } from 'lucide-react';
import { store } from '../../lib/store';
import { Profile } from '../../types';

interface JudgeToolbarProps {
  currentUser: Profile;
  onNavigate?: (page: string) => void;
  onOpenAdminQueue?: () => void;
  onOpenDriverVerification?: () => void;
}

export const JudgeToolbar: React.FC<JudgeToolbarProps> = ({
  currentUser,
  onNavigate,
  onOpenAdminQueue,
  onOpenDriverVerification,
}) => {
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const profiles = store.getProfiles();
  const pendingApps = store.getVerificationApplications().filter((a) => a.status === 'pending');

  const handleSwitchUser = (userId: string) => {
    store.setCurrentUserId(userId);
  };

  const handleResetData = () => {
    store.resetToDefaults();
    setResetMessage('Reset demo state!');
    setTimeout(() => setResetMessage(null), 2000);
  };

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs py-1.5 px-4 z-40 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Hackathon Judge Sandbox badge & quick switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold tracking-wide">
            <Zap className="w-3.5 h-3.5" />
            <span>HACKATHON EVALUATION SANDBOX</span>
          </div>

          <span className="text-slate-600 hidden sm:inline">|</span>

          {/* Quick Persona Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] hidden md:inline">Active Persona:</span>
            <div className="flex items-center gap-1">
              {profiles.slice(0, 4).map((p) => {
                const isActive = p.id === currentUser.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSwitchUser(p.id)}
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                    title={`Switch active user to ${p.display_name} (${p.verification_status})`}
                  >
                    {p.display_name.split(' ')[0]} ({p.verification_status === 'verified' ? '✓' : '…'})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {resetMessage && (
            <span className="text-emerald-400 font-medium text-[11px] animate-fade-in">
              {resetMessage}
            </span>
          )}

          {/* Verification Admin Trigger */}
          {onOpenAdminQueue && (
            <button
              onClick={onOpenAdminQueue}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-700 hover:bg-emerald-900 transition-colors text-[11px] font-semibold"
              title="Open Campus Transport Admin verification queue"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Queue ({pendingApps.length} pending)</span>
            </button>
          )}

          {/* Submit Verification for active user */}
          {currentUser.verification_status !== 'verified' && onOpenDriverVerification && (
            <button
              onClick={onOpenDriverVerification}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors text-[11px]"
              title="Submit driver verification for active persona"
            >
              <span>Submit Verification</span>
            </button>
          )}

          <button
            onClick={handleResetData}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px]"
            title="Reset rides, bookings, and notifications to default sample data"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
