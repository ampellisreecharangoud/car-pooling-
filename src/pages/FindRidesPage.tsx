import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
  Users,
  Compass,
  ArrowUpDown,
  Map as MapIcon,
  List,
  Zap,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { Ride, Profile, SearchCriteria, RealtimeRidePayload } from '../types';
import { scoreAndFilterRides } from '../lib/matchingEngine';
import { RideCard } from '../components/matching/RideCard';
import { RouteMap } from '../components/map/RouteMap';
import { store } from '../lib/store';

interface FindRidesPageProps {
  rides: Ride[];
  currentUser: Profile;
  initialCriteria?: SearchCriteria;
  onRequestBooking: (ride: Ride) => void;
  onOpenReport?: (driverId: string, driverName: string, rideId: string) => void;
}

export const FindRidesPage: React.FC<FindRidesPageProps> = ({
  rides,
  currentUser,
  initialCriteria,
  onRequestBooking,
  onOpenReport,
}) => {
  const [pickup, setPickup] = useState(initialCriteria?.pickup || '');
  const [destination, setDestination] = useState(initialCriteria?.destination || '');
  const [date, setDate] = useState(initialCriteria?.date || '2026-10-12');
  const [departureTime, setDepartureTime] = useState(initialCriteria?.departureTime || '08:30');
  const [seats, setSeats] = useState(initialCriteria?.seats || 1);
  const [maxPrice, setMaxPrice] = useState<number>(30);
  const [sortBy, setSortBy] = useState<'match' | 'price_low' | 'departure_time' | 'seats_available'>('match');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedRideForMap, setSelectedRideForMap] = useState<Ride | null>(null);

  // Real-time live notification banner state
  const [realtimeAlert, setRealtimeAlert] = useState<{
    message: string;
    type: 'insert' | 'update';
  } | null>(null);

  // Subscribe to real-time ride updates (Supabase Realtime Channel emulation)
  useEffect(() => {
    const unsubscribe = store.subscribeToRideChanges((payload: RealtimeRidePayload) => {
      if (payload.eventType === 'INSERT' && payload.newRide) {
        setRealtimeAlert({
          message: `Live update: New ride to ${payload.newRide.destination} just posted by ${payload.newRide.driver?.display_name || 'a commuter'}!`,
          type: 'insert',
        });
      } else if (payload.eventType === 'UPDATE' && payload.newRide) {
        setRealtimeAlert({
          message: `Live update: Available seats updated for trip to ${payload.newRide.destination} (${payload.newRide.available_seats} seat${payload.newRide.available_seats !== 1 ? 's' : ''} left).`,
          type: 'update',
        });
      }
      setTimeout(() => {
        setRealtimeAlert(null);
      }, 5000);
    });

    return unsubscribe;
  }, []);

  const criteria: SearchCriteria = useMemo(
    () => ({
      pickup,
      destination,
      date,
      departureTime,
      seats,
      maxPrice,
      sortBy,
    }),
    [pickup, destination, date, departureTime, seats, maxPrice, sortBy]
  );

  const matchedRides = useMemo(() => {
    return scoreAndFilterRides(rides, criteria);
  }, [rides, criteria]);

  const activeRideForMap = selectedRideForMap || matchedRides[0] || null;

  const handleSimulateRealtimePost = () => {
    store.simulateIncomingRideOffer();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Realtime Alert Banner */}
      {realtimeAlert && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-200 animate-pulse" />
            <span className="font-semibold">{realtimeAlert.message}</span>
          </div>
          <span className="text-[11px] text-emerald-200">Matching engine updated</span>
        </div>
      )}

      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Find a Shared Ride</h1>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>Realtime Live Feed</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover verified campus & commuter routes ranked by proximity and schedule alignment
          </p>
        </div>

        {/* View toggle (List vs Map) & Realtime Simulator button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateRealtimePost}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            title="Simulate a new commuter posting a ride in real-time"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulate Live Ride Offer</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map Split</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Pickup */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
              Pickup Area
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="e.g. Student Union, Campus"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
              Destination
            </label>
            <div className="relative">
              <Compass className="w-4 h-4 text-slate-900 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="e.g. Downtown Tech Station"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
            />
          </div>

          {/* Time */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
              Target Departure
            </label>
            <input
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
            />
          </div>

          {/* Seats */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
              Seats Needed
            </label>
            <select
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
            >
              <option value={1}>1 Seat</option>
              <option value={2}>2 Seats</option>
              <option value={3}>3 Seats</option>
              <option value={4}>4 Seats</option>
            </select>
          </div>
        </div>

        {/* Secondary Filters: Sort & Max Price */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Sort By:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSortBy('match')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  sortBy === 'match'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Best Match
              </button>
              <button
                onClick={() => setSortBy('price_low')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  sortBy === 'price_low'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Lowest Price
              </button>
              <button
                onClick={() => setSortBy('departure_time')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  sortBy === 'departure_time'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Earliest
              </button>
              <button
                onClick={() => setSortBy('seats_available')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  sortBy === 'seats_available'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Most Seats
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500">
              Max Contribution: <span className="font-mono font-semibold text-slate-900">${maxPrice}</span>
            </span>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="accent-emerald-600 cursor-pointer w-28"
            />
          </div>
        </div>
      </div>

      {/* Results View */}
      {viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 space-y-4">
            <div className="text-xs text-slate-500 font-medium">
              Showing {matchedRides.length} matching ride{matchedRides.length !== 1 ? 's' : ''}
            </div>
            {matchedRides.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-2">
                <p className="font-semibold text-slate-900 text-sm">No rides match your criteria</p>
                <p className="text-xs text-slate-500">
                  Try adjusting the travel date, increasing the max contribution, or widening your pickup area.
                </p>
              </div>
            ) : (
              matchedRides.map((ride) => (
                <div
                  key={ride.id}
                  onClick={() => setSelectedRideForMap(ride)}
                  className={`cursor-pointer transition-all ${
                    activeRideForMap?.id === ride.id ? 'ring-2 ring-emerald-600 rounded-xl' : ''
                  }`}
                >
                  <RideCard
                    ride={ride}
                    currentUser={currentUser}
                    onRequestBooking={onRequestBooking}
                    onOpenReport={onOpenReport}
                  />
                </div>
              ))
            )}
          </div>

          <div className="lg:col-span-6 sticky top-24">
            {activeRideForMap ? (
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">
                    Live Route: {activeRideForMap.pickup_location} → {activeRideForMap.destination}
                  </span>
                  <span className="font-mono text-emerald-700 font-semibold">
                    ${activeRideForMap.price_per_seat.toFixed(2)}/seat
                  </span>
                </div>
                <RouteMap
                  pickupLat={activeRideForMap.pickup_lat}
                  pickupLng={activeRideForMap.pickup_lng}
                  pickupLabel={activeRideForMap.pickup_location}
                  destLat={activeRideForMap.dest_lat}
                  destLng={activeRideForMap.dest_lng}
                  destLabel={activeRideForMap.destination}
                  stops={activeRideForMap.stops}
                  className="h-96 w-full"
                />
              </div>
            ) : (
              <div className="bg-slate-100 rounded-xl p-8 text-center text-xs text-slate-500">
                Select a ride from the list to preview its interactive OpenStreetMap route.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Showing {matchedRides.length} matching ride{matchedRides.length !== 1 ? 's' : ''}
            </span>
            <span>All costs calculated non-commercially</span>
          </div>

          {matchedRides.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <Search className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-bold text-slate-900 text-sm">No rides match your current filters</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No active routes found on {date} for {seats} seat(s). Click "Simulate Live Ride Offer" above
                or relax your time and location filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchedRides.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  currentUser={currentUser}
                  onRequestBooking={onRequestBooking}
                  onOpenReport={onOpenReport}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
