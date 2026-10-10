import React, { useState } from 'react';
import {
  Car,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import { Profile, Ride, Booking } from '../types';
import { store } from '../lib/store';

interface DriverDashboardProps {
  currentUser: Profile;
  onNavigate: (page: string) => void;
  onOpenReport?: (userId: string, userName: string, rideId: string) => void;
  onOpenVerification?: () => void;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({
  currentUser,
  onNavigate,
  onOpenReport,
  onOpenVerification,
}) => {
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Get driver's rides and all bookings
  const allRides = store.getRides().filter((r) => r.driver_id === currentUser.id);
  const allBookings = store.getBookings();
  const vehicles = store.getVehiclesByOwner(currentUser.id);

  // Filter pending booking requests across all this driver's rides
  const myRideIds = new Set(allRides.map((r) => r.id));
  const pendingRequests = allBookings.filter(
    (b) => myRideIds.has(b.ride_id) && b.status === 'pending'
  );

  const confirmedBookings = allBookings.filter(
    (b) => myRideIds.has(b.ride_id) && b.status === 'confirmed'
  );

  const handleRespond = (bookingId: string, action: 'confirm' | 'reject') => {
    const res = store.respondToBooking(bookingId, action);
    if (res.success) {
      setFeedbackMessage(
        action === 'confirm' ? 'Booking confirmed & seats reserved!' : 'Booking request declined.'
      );
    } else {
      setFeedbackMessage(`Error: ${res.error}`);
    }
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleCancelRide = (rideId: string) => {
    if (window.confirm('Are you sure you want to cancel this ride? All booked passengers will be notified.')) {
      const res = store.cancelRide(rideId);
      if (res.success) {
        setFeedbackMessage('Ride cancelled. Passengers notified.');
      } else {
        setFeedbackMessage(`Error: ${res.error}`);
      }
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile / Welcome */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={
              currentUser.avatar_url ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
            }
            alt={currentUser.display_name}
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-full object-cover border border-slate-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{currentUser.display_name}</h1>
              {currentUser.verification_status === 'verified' && (
                <span title="Verified Driver">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {currentUser.college_or_org || 'Campus Commuter'} · Driver Console
            </p>
            {vehicles.length > 0 && (
              <p className="text-xs text-slate-600 mt-1">
                Vehicle: {vehicles[0].make} {vehicles[0].model} ({vehicles[0].color})
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser.verification_status !== 'verified' && onOpenVerification && (
            <button
              onClick={onOpenVerification}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {currentUser.verification_status === 'pending'
                  ? 'Status: Pending Review'
                  : 'Verify Driver Account'}
              </span>
            </button>
          )}

          <button
            onClick={() => onNavigate('offer-ride')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Ride</span>
          </button>
        </div>
      </div>

      {/* Verification Status Notice if not yet verified */}
      {currentUser.verification_status === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold block">Verification Status: Pending Review</span>
              <span className="text-amber-800 text-[11px]">
                Your license and insurance documents are currently under queue review by campus transport safety.
              </span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md self-start sm:self-auto">
            Queue Status: In Progress
          </span>
        </div>
      )}

      {currentUser.verification_status === 'not_submitted' && onOpenVerification && (
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-slate-500 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 block">Unlock Verified Driver Badge</span>
              <span className="text-slate-500 text-[11px]">
                Submit your driver's license and vehicle registration to build passenger trust and appear higher in search results.
              </span>
            </div>
          </div>
          <button
            onClick={onOpenVerification}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg self-start sm:self-auto"
          >
            Submit Documents
          </button>
        </div>
      )}

      {feedbackMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* PENDING BOOKING REQUESTS (HIGH PRIORITY) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Pending Booking Requests ({pendingRequests.length})
          </h2>
          <span className="text-xs text-slate-500">
            Driver approval required before seats are locked
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-xs text-slate-500">
            No pending passenger requests at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => {
              const ride = allRides.find((r) => r.id === req.ride_id);
              return (
                <div
                  key={req.id}
                  className="bg-white rounded-xl border border-amber-200 shadow-xs p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          req.passenger?.avatar_url ||
                          'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=128&q=80'
                        }
                        alt={req.passenger?.display_name || 'Passenger'}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-sm text-slate-900">
                          {req.passenger?.display_name || 'Passenger'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {req.passenger?.college_or_org || 'Campus Commuter'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-bold font-mono text-emerald-700">
                        ${req.total_price.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        {req.seats_requested} seat{req.seats_requested > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="font-semibold text-slate-900">
                      Destination: {ride?.destination}
                    </div>
                    <div className="text-slate-500">
                      Departure: {ride?.travel_date} at {ride?.departure_time}
                    </div>
                    {req.pickup_note && (
                      <div className="text-slate-600 italic mt-1">
                        Note: "{req.pickup_note}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleRespond(req.id, 'reject')}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleRespond(req.id, 'confirm')}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                    >
                      Accept & Confirm
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* OFFERED RIDES LIST */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Your Scheduled Rides ({allRides.length})
        </h2>

        {allRides.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
            <Car className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-slate-900 text-sm">You haven't posted any rides yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Share your routine commute route to start helping fellow students and splitting travel costs.
            </p>
            <button
              onClick={() => onNavigate('offer-ride')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              Post Your First Ride
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {allRides.map((ride) => {
              const rideBookings = confirmedBookings.filter((b) => b.ride_id === ride.id);
              const isCancelled = ride.status === 'cancelled';

              return (
                <div
                  key={ride.id}
                  className={`bg-white rounded-xl border p-5 transition-all shadow-xs space-y-4 ${
                    isCancelled ? 'border-slate-200 opacity-60' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {ride.pickup_location} → {ride.destination}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{ride.travel_date} at {ride.departure_time}</span>
                        <span>·</span>
                        <span>${ride.price_per_seat.toFixed(2)}/seat</span>
                        <span>·</span>
                        <span className={ride.available_seats === 0 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                          {ride.available_seats} of {ride.total_seats} seats free
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCancelled ? (
                        <span className="text-xs font-semibold text-rose-600 px-3 py-1 bg-rose-50 rounded-lg">
                          Cancelled
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCancelRide(ride.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          Cancel Ride
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Confirmed passengers roster */}
                  {rideBookings.length > 0 && (
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-2">
                      <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                        Confirmed Passengers ({rideBookings.length})
                      </div>
                      <div className="divide-y divide-slate-200/60">
                        {rideBookings.map((b) => (
                          <div
                            key={b.id}
                            className="py-1.5 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">
                                {b.passenger?.display_name || 'Passenger'}
                              </span>
                              <span className="text-slate-400">·</span>
                              <span className="text-slate-500">
                                {b.seats_requested} seat{b.seats_requested > 1 ? 's' : ''}
                              </span>
                            </div>
                            <span className="text-slate-500 font-mono">
                              ${b.total_price.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
