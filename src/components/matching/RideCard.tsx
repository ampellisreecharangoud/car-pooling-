import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, ShieldCheck, Car, ChevronDown, ChevronUp, Flag } from 'lucide-react';
import { Ride, Profile } from '../../types';
import { RouteMap } from '../map/RouteMap';

interface RideCardProps {
  ride: Ride;
  currentUser: Profile;
  onRequestBooking: (ride: Ride) => void;
  onOpenReport?: (driverId: string, driverName: string, rideId: string) => void;
}

export const RideCard: React.FC<RideCardProps> = ({
  ride,
  currentUser,
  onRequestBooking,
  onOpenReport,
}) => {
  const [mapExpanded, setMapExpanded] = useState(false);

  const isMyRide = ride.driver_id === currentUser.id;
  const isSoldOut = ride.available_seats === 0;
  const matchExplanation = ride.matchExplanation;

  // Format date
  const formattedDate = new Date(`${ride.travel_date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-all shadow-xs">
      <div className="p-5 space-y-4">
        {/* Top Header Row: Driver Info & Price */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={
                ride.driver?.avatar_url ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'
              }
              alt={ride.driver?.display_name || 'Driver'}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900">
                  {ride.driver?.display_name || 'Campus Driver'}
                </span>
                {ride.driver?.verification_status === 'verified' && (
                  <span title="Verified Campus Identity">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <span>{ride.driver?.college_or_org || 'Campus Commuter'}</span>
                {ride.vehicle && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>
                      {ride.vehicle.make} {ride.vehicle.model}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Price per seat */}
          <div className="text-right shrink-0">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 block leading-tight">
              ${ride.price_per_seat.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-500">per seat</span>
          </div>
        </div>

        {/* Route Details: Pickup & Destination */}
        <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Pickup Point
            </div>
            <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block -ml-6 mr-4 ring-2 ring-white"></span>
              {ride.pickup_location}
            </div>
          </div>

          {ride.stops && ride.stops.length > 0 && (
            <div className="text-xs text-slate-500 pl-1">
              <span>Via: {ride.stops.map((s) => s.location).join(', ')}</span>
            </div>
          )}

          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Destination
            </div>
            <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-900 inline-block -ml-6 mr-4 ring-2 ring-white"></span>
              {ride.destination}
            </div>
          </div>
        </div>

        {/* Metadata Line: Date, Time, Luggage, Seats Available (Unboxed text with dots) */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDate}</span>
            </div>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{ride.departure_time}</span>
            </div>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span className={ride.available_seats === 1 ? 'font-semibold text-amber-700' : ''}>
                {ride.available_seats} of {ride.total_seats} seat{ride.total_seats > 1 ? 's' : ''} free
              </span>
            </div>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="capitalize">{ride.luggage_capacity} bag space</span>
          </div>

          {/* Toggle Map Preview */}
          <button
            onClick={() => setMapExpanded(!mapExpanded)}
            className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-medium"
          >
            <span>{mapExpanded ? 'Hide Map' : 'View Route'}</span>
            {mapExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Intelligent Match Engine Explanation (If calculated) */}
        {matchExplanation && (
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-700 font-mono">
                {matchExplanation.match_score}% Match
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-600">{matchExplanation.reasons.join(' · ')}</span>
            </div>
          </div>
        )}

        {/* Map Preview Drawer */}
        {mapExpanded && (
          <div className="pt-2">
            <RouteMap
              pickupLat={ride.pickup_lat}
              pickupLng={ride.pickup_lng}
              pickupLabel={ride.pickup_location}
              destLat={ride.dest_lat}
              destLng={ride.dest_lng}
              destLabel={ride.destination}
              stops={ride.stops}
              className="h-56 w-full"
            />
          </div>
        )}

        {/* Notes if present */}
        {ride.notes && (
          <p className="text-xs text-slate-500 italic bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
            "{ride.notes}"
          </p>
        )}

        {/* Action Controls */}
        <div className="pt-2 flex items-center justify-between gap-3">
          {onOpenReport && (
            <button
              onClick={() =>
                onOpenReport(ride.driver_id, ride.driver?.display_name || 'Driver', ride.id)
              }
              className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
              title="Report issue with ride"
            >
              <Flag className="w-3 h-3" />
              <span>Report</span>
            </button>
          )}

          <div className="ml-auto">
            {isMyRide ? (
              <span className="text-xs font-medium text-slate-500 px-3 py-1.5 bg-slate-100 rounded-lg">
                Your Offered Ride
              </span>
            ) : isSoldOut ? (
              <span className="text-xs font-semibold text-rose-600 px-3 py-1.5 bg-rose-50 rounded-lg">
                Fully Booked
              </span>
            ) : (
              <button
                onClick={() => onRequestBooking(ride)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
              >
                Request Seat
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
