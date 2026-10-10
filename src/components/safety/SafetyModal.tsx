import React from 'react';
import { X, ShieldCheck, AlertCircle, Phone, Lock, UserCheck } from 'lucide-react';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Safety & Trust Guidelines</h2>
              <p className="text-xs text-slate-500">Commuter protection, verification protocols & safety standards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-600">
          <div className="space-y-4">
            <div className="flex gap-3">
              <UserCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Verified Campus & Work Identities</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  RideMate prioritizes authenticated institutional email addresses (.edu and verified enterprise accounts). Driver documents must undergo manual status verification before displaying the verified badge.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Privacy-First Data Protection</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  License plates are masked publicly (e.g. 7XY•••9) until a ride request is accepted. Personal home addresses are never published; public meeting zones (student unions, campus gates, transit plazas) are used for pickups.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Strict Zero-Overbooking Capacity</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vehicles are strictly capped at their legal passenger seat belts. Our atomic transaction engine automatically locks seats and rejects overflow requests.
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Assistance Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <Phone className="w-4 h-4 text-amber-700" />
              <span>Campus Security & Emergency Directory</span>
            </div>
            <p className="text-[11px] text-amber-800">
              In an immediate life-safety emergency, always dial 911 directly. RideMate is an informational coordination tool and does not replace emergency dispatch services.
            </p>
            <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200/60 font-mono text-[11px] text-amber-950 space-y-1">
              <div>Campus Security Escort: (555) 019-SAFE (24/7)</div>
              <div>Metro Transit Security Hotline: (555) 012-3344</div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
