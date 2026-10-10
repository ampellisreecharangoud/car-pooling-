import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Clock3,
  XCircle,
  AlertCircle,
  Search,
  Car,
  ChevronRight,
} from 'lucide-react';
import { Profile, Booking } from '../types';
import { store } from '../lib/store';

interface PassengerDashboardProps {
  currentUser: Profile;
  onNavigate: (page: string) => void;
  onOpenReport?: (driverId: string, driverName: string, rideId: string) => void;
}

export const PassengerDashboard: React.FC<PassengerDashboardProps> = ({
  currentUser,
  onNavigate,
  onOpenReport,
}) => {
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const bookings = store.getBookingsByPassenger(currentUser.id);

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel your seat reservation? Your reserved seat will be returned to the pool.')) {
      const res = store.cancelBooking(bookingId);
      if (res.success) {
        setFeedbackMessage('Booking cancelled. Seat restored to available capacity.');
      } else {
        setFeedbackMessage(`Error: ${res.error}`);
      }
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Bookings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track seat reservation statuses, driver confirmations, and upcoming itineraries
          </p>
        </div>

        <button
          onClick={() => onNavigate('find-rides')}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 self-start sm:self-auto shadow-xs"
        >
          <Search className="w-4 h-4" />
          <span>Find Another Ride</span>
        </button>
      </div>

      {feedbackMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Car className="w-10 h-10 text-slate-400 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">No active bookings yet</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Ready to commute? Search your campus or workplace corridor to find friendly peers heading your way.
          </p>
          <button
            onClick={() => onNavigate('find-rides')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
          >
            Explore Routes
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const ride = booking.ride;
            const isPending = booking.status === 'pending';
            const isConfirmed = booking.status === 'confirmed';
            const isCancelled = booking.status === 'cancelled';
            const isRejected = booking.status === 'rejected';

            return (
              <div
                key={booking.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {ride ? `${ride.pickup_location} → ${ride.destination}` : 'Corridor Commute'}
                      </span>
                      {/* Status indicator unboxed text with styling */}
                      {isConfirmed && (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                          Confirmed
                        </span>
                      )}
                      {isPending && (
                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                          Pending Approval
                        </span>
                      )}
                      {isCancelled && (
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          Cancelled
                        </span>
                      )}
                      {isRejected && (
                        <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                          Declined
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                      <span>{ride?.travel_date}</span>
                      <span>·</span>
                      <span>{ride?.departure_time}</span>
                      <span>·</span>
                      <span>
                        {booking.seats_requested} seat{booking.seats_requested > 1 ? 's' : ''} reserved
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-bold font-mono text-slate-900">
                      ${booking.total_price.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-slate-500 block">estimated cost-share</span>
                  </div>
                </div>

                {/* Driver Details */}
                {ride?.driver && (
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          ride.driver.avatar_url ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'
                        }
                        alt={ride.driver.display_name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-semibold text-slate-900">
                          Driver: {ride.driver.display_name}
                        </div>
                        <div className="text-slate-500">
                          {ride.vehicle ? `${ride.vehicle.make} ${ride.vehicle.model}` : 'Verified Vehicle'} · Masked Plate: {ride.vehicle?.license_plate_masked || '7XY•••9'}
                        </div>
                      </div>
                    </div>

                    {/* Cancellation control */}
                    {(isPending || isConfirmed) && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors self-start sm:self-auto"
                      >
                        Cancel Reservation
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
