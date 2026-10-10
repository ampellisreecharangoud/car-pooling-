import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, XCircle, Clock, FileText, Check, AlertCircle } from 'lucide-react';
import { store } from '../../lib/store';
import { VerificationApplication } from '../../types';

interface AdminVerificationQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminVerificationQueueModal: React.FC<AdminVerificationQueueModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [rejectReason, setRejectReason] = useState<string>('');
  const [selectedAppForReject, setSelectedAppForReject] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const applications = store.getVerificationApplications();

  const handleApprove = (appId: string, driverName: string) => {
    const res = store.reviewDriverVerification(appId, 'verified', 'Approved after campus safety audit.');
    if (res.success) {
      setFeedback(`Approved & verified driver: ${driverName}`);
    }
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleReject = (appId: string, driverName: string) => {
    const res = store.reviewDriverVerification(
      appId,
      'rejected',
      rejectReason.trim() || 'Missing valid insurance documentation.'
    );
    if (res.success) {
      setFeedback(`Declined application for ${driverName}`);
    }
    setSelectedAppForReject(null);
    setRejectReason('');
    setTimeout(() => setFeedback(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold">Campus Safety Admin: Driver Verification Queue</h2>
              <p className="text-xs text-slate-400">Review credentials, verify licenses & authorize carpool drivers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedback && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Content Table */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="text-xs text-slate-500 font-medium">
            Total Applications: {applications.length}
          </div>

          <div className="space-y-4">
            {applications.map((app) => {
              const isPending = app.status === 'pending';
              const isVerified = app.status === 'verified';
              const isRejected = app.status === 'rejected';

              return (
                <div
                  key={app.id}
                  className={`p-5 rounded-xl border transition-all text-xs space-y-3 ${
                    isPending
                      ? 'border-amber-300 bg-amber-50/20'
                      : isVerified
                      ? 'border-emerald-200 bg-emerald-50/10'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{app.driver_name}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500">{app.driver_email}</span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Submitted on: {new Date(app.submitted_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-md capitalize ${
                          isVerified
                            ? 'bg-emerald-100 text-emerald-800'
                            : isPending
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {app.status === 'pending' ? 'Pending Review' : app.status}
                      </span>
                    </div>
                  </div>

                  {/* Document and Vehicle Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Driver's License</span>
                      <span className="font-mono font-semibold text-slate-900">{app.license_number}</span>
                      <span className="text-[11px] text-slate-500 block">
                        {app.license_state} · Exp: {app.license_expiry}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block">Vehicle</span>
                      <span className="font-semibold text-slate-900">
                        {app.vehicle_make} {app.vehicle_model} ({app.vehicle_year})
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono block">
                        Plate: {app.vehicle_plate}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block">Insurance Policy</span>
                      <span className="font-semibold text-slate-900">{app.insurance_provider}</span>
                      <span className="text-[11px] text-slate-500 font-mono block">
                        Policy: {app.insurance_policy_no}
                      </span>
                    </div>
                  </div>

                  {app.reviewer_notes && (
                    <div className="text-[11px] text-slate-500 italic">
                      Reviewer Notes: "{app.reviewer_notes}"
                    </div>
                  )}

                  {/* Review Actions */}
                  {isPending && (
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                      {selectedAppForReject === app.id ? (
                        <div className="flex items-center gap-2 w-full max-w-md">
                          <input
                            type="text"
                            placeholder="Rejection reason..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                          />
                          <button
                            onClick={() => handleReject(app.id, app.driver_name)}
                            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700"
                          >
                            Confirm Reject
                          </button>
                          <button
                            onClick={() => setSelectedAppForReject(null)}
                            className="px-2 py-1.5 text-slate-500 hover:text-slate-800"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setSelectedAppForReject(app.id)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg transition-colors"
                          >
                            Reject Application
                          </button>
                          <button
                            onClick={() => handleApprove(app.id, app.driver_name)}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-xs"
                          >
                            Approve & Verify Driver
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};
