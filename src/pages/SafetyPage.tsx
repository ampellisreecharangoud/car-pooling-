import React from 'react';
import { ShieldCheck, Lock, UserCheck, PhoneCall, AlertTriangle, EyeOff } from 'lucide-react';

interface SafetyPageProps {
  onOpenReport?: () => void;
  onOpenSafetyModal?: () => void;
}

export const SafetyPage: React.FC<SafetyPageProps> = ({ onOpenReport, onOpenSafetyModal }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
          Trust, Safety & Privacy
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Commuting with Mutual Accountability
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Safety in shared mobility is founded on institutional verification, coordinate privacy,
          and transparent booking accountability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl w-fit">
            <UserCheck className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Institutional Identity Verification</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Accounts are bound to verified university (.edu) emails or workplace corporate domains.
            Driver identity documents are reviewed before verification badges are approved.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl w-fit">
            <EyeOff className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Residential Coordinate Masking</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Exact home street addresses are never publicly published. Pickups and drop-offs are coordinated
            at designated public hubs (e.g. Campus Student Union, Library Gate, Transit plazas).
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl w-fit">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Atomic Capacity Limits</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Vehicles never exceed legal passenger seat belt counts. Our transactional backend
            enforces atomic row locks on seat inventory to prevent duplicate concurrent reservations.
          </p>
        </div>
      </div>

      {/* Campus Security & Prototype Disclaimers */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
          <PhoneCall className="w-5 h-5" />
          <span>Emergency Support Directory</span>
        </div>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          RideMate is a coordination utility platform for campus commuters and does not provide
          direct emergency dispatch. In any immediate crisis or road incident, call 911 immediately.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs font-mono text-slate-300">
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
            <div>Campus Escort & Security Dispatch:</div>
            <div className="text-white font-bold text-sm mt-0.5">(555) 019-SAFE</div>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
            <div>Metro Transit Police Desk:</div>
            <div className="text-white font-bold text-sm mt-0.5">(555) 012-3344</div>
          </div>
        </div>
      </div>
    </div>
  );
};
