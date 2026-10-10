import React, { useState } from 'react';
import {
  Car,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Profile, Vehicle } from '../types';
import { store } from '../lib/store';
import { resolveCoordinatesForLocation } from '../lib/matchingEngine';

interface OfferRidePageProps {
  currentUser: Profile;
  onNavigate: (page: string) => void;
  onOpenCostCalc?: () => void;
  onOpenVerification?: () => void;
}

export const OfferRidePage: React.FC<OfferRidePageProps> = ({
  currentUser,
  onNavigate,
  onOpenCostCalc,
  onOpenVerification,
}) => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [travelDate, setTravelDate] = useState('2026-10-13');
  const [departureTime, setDepartureTime] = useState('08:30');
  const [totalSeats, setTotalSeats] = useState<number>(3);
  const [totalTripCost, setTotalTripCost] = useState<number>(18.0);
  const [pricePerSeat, setPricePerSeat] = useState<number>(5.0);
  const [luggageCapacity, setLuggageCapacity] = useState<'small' | 'medium' | 'large'>('medium');
  const [notes, setNotes] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [stops, setStops] = useState<{ location: string; latitude: number; longitude: number }[]>([]);
  const [newStopText, setNewStopText] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const vehicles = store.getVehiclesByOwner(currentUser.id);

  // Set default vehicle
  React.useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [vehicles, selectedVehicleId]);

  // Recalculate suggested per-seat price whenever total cost or seats change
  const handleAutoPrice = () => {
    if (totalSeats > 0) {
      // Driver pays 25% share, remaining split among seats
      const driverShare = totalTripCost * 0.25;
      const passengerPool = totalTripCost - driverShare;
      const suggested = Math.max(1, Number((passengerPool / totalSeats).toFixed(2)));
      setPricePerSeat(suggested);
    }
  };

  const handleAddStop = () => {
    if (!newStopText.trim()) return;
    const coords = resolveCoordinatesForLocation(newStopText.trim());
    setStops([...stops, { location: newStopText.trim(), latitude: coords.lat, longitude: coords.lng }]);
    setNewStopText('');
  };

  const handleRemoveStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!pickup.trim() || !destination.trim()) {
      setErrorMessage('Please specify both pickup and destination locations.');
      return;
    }

    if (totalSeats <= 0 || totalSeats > 8) {
      setErrorMessage('Total passenger seats must be between 1 and 8.');
      return;
    }

    if (pricePerSeat < 0) {
      setErrorMessage('Price per seat cannot be negative.');
      return;
    }

    const pickupCoords = resolveCoordinatesForLocation(pickup);
    const destCoords = resolveCoordinatesForLocation(destination);

    const result = store.createRide({
      pickup_location: pickup.trim(),
      pickup_lat: pickupCoords.lat,
      pickup_lng: pickupCoords.lng,
      destination: destination.trim(),
      dest_lat: destCoords.lat,
      dest_lng: destCoords.lng,
      travel_date: travelDate,
      departure_time: departureTime,
      total_trip_cost: totalTripCost,
      price_per_seat: pricePerSeat,
      total_seats: totalSeats,
      vehicle_id: selectedVehicleId || undefined,
      notes: notes.trim(),
      luggage_capacity: luggageCapacity,
      stops,
    });

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to create ride offer.');
      return;
    }

    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Ride Published Successfully!</h1>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Your route to {destination} on {travelDate} is now open for bookings.
          Passengers matching this corridor will be able to discover your empty seats.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <button
            onClick={() => onNavigate('driver-dashboard')}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors"
          >
            Go to Driver Dashboard
          </button>
          <button
            onClick={() => {
              setIsSuccess(false);
              setPickup('');
              setDestination('');
              setStops([]);
            }}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
          >
            Post Another Ride
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Offer Empty Seats</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Publish your upcoming journey to share travel costs and reduce single-occupancy trips
        </p>
      </div>

      {currentUser.verification_status === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-center justify-between gap-3">
          <div>
            <span className="font-bold block">Verification Status: Pending Review</span>
            <span className="text-amber-800 text-[11px]">
              You can draft and publish this route. The "Verified Driver" badge will be added once approved.
            </span>
          </div>
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
            Under Review
          </span>
        </div>
      )}

      {currentUser.verification_status === 'not_submitted' && onOpenVerification && (
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 flex items-center justify-between gap-3">
          <div>
            <span className="font-bold text-slate-900 block">Unverified Driver Profile</span>
            <span className="text-slate-500 text-[11px]">
              Submit your driver credentials to earn the verified campus badge and receive more booking requests.
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenVerification}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs shrink-0"
          >
            Submit Documents
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        {/* Route Details */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. Route & Schedule
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Pickup Meeting Point *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Campus Student Union (North Gate)"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
                />
              </div>
              {/* Preset campus quick buttons */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['Campus Union', 'Science Quad', 'Central Library'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setPickup(preset)}
                    className="text-[10px] text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Final Destination *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-900 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Downtown Metro Tech Station"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['Downtown Station', 'BioTech Park', 'Oakland Ferry'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDestination(preset)}
                    className="text-[10px] text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Intermediate Stops */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              Optional Intermediate Stops / Express Gates
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Westside Transit Hub"
                value={newStopText}
                onChange={(e) => setNewStopText(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddStop}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stop</span>
              </button>
            </div>

            {stops.length > 0 && (
              <div className="space-y-1 pt-1">
                {stops.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white px-3 py-1.5 rounded-md border border-slate-200 text-xs text-slate-700"
                  >
                    <span>
                      Stop {idx + 1}: {s.location}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStop(idx)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Travel Date *
              </label>
              <input
                type="date"
                required
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Departure Time *
              </label>
              <input
                type="time"
                required
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Capacity & Cost-Sharing */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900">
              2. Passenger Seats & Fair Cost Recovery
            </h2>
            {onOpenCostCalc && (
              <button
                type="button"
                onClick={onOpenCostCalc}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Open Calculator</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Available Passenger Seats
              </label>
              <select
                value={totalSeats}
                onChange={(e) => setTotalSeats(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
              >
                <option value={1}>1 Passenger Seat</option>
                <option value={2}>2 Passenger Seats</option>
                <option value={3}>3 Passenger Seats</option>
                <option value={4}>4 Passenger Seats</option>
                <option value={5}>5 Passenger Seats</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Total Trip Cost ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={totalTripCost}
                onChange={(e) => setTotalTripCost(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Per-Seat Price ($)
                </label>
                <button
                  type="button"
                  onClick={handleAutoPrice}
                  className="text-[10px] text-emerald-700 hover:underline font-medium"
                >
                  Auto-suggest
                </button>
              </div>
              <input
                type="number"
                min="0"
                step="0.25"
                value={pricePerSeat}
                onChange={(e) => setPricePerSeat(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600 font-mono font-bold"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            Per-seat contributions are calculated on a direct cost-recovery basis. Drivers share direct fuel & tolls without commercial margin.
          </p>
        </div>

        {/* Vehicle & Preferences */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            3. Vehicle & Trip Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Vehicle Used
              </label>
              {vehicles.length > 0 ? (
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} ({v.year}) · Plate: {v.license_plate_masked}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs text-slate-500 italic p-2 bg-slate-50 rounded-lg">
                  No vehicle registered. Default campus profile will be used.
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Luggage Space Allowed
              </label>
              <select
                value={luggageCapacity}
                onChange={(e) => setLuggageCapacity(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
              >
                <option value="small">Small (Backpack / Laptop bag only)</option>
                <option value="medium">Medium (Standard gym bag / duffel)</option>
                <option value="large">Large (Suitcase or research gear)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Notes for Passengers (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Non-smoking vehicle; leaving on the dot; trunk space available"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Publishing as {currentUser.display_name}
          </span>
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
          >
            Publish Ride Offer
          </button>
        </div>
      </form>
    </div>
  );
};
