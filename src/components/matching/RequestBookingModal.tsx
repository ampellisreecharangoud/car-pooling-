import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle, AlertCircle, DollarSign, Users } from 'lucide-react';
import { Ride, Profile } from '../../types';
import { store } from '../../lib/store';

interface RequestBookingModalProps {
  ride: Ride | null;
  currentUser: Profile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RequestBookingModal: React.FC<RequestBookingModalProps> = ({
  ride,
  currentUser,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [seatsRequested, setSeatsRequested] = useState<number>(1);
  const [pickupNote, setPickupNote] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen || !ride) return null;

  const totalPrice = Number((ride.price_per_seat * seatsRequested).toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const result = store.requestBooking({
      ride_id: ride.id,
      seats_requested: seatsRequested,
      pickup_note: pickupNote.trim(),
    });

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to request booking');
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setPickupNote('');
      setSeatsRequested(1);
      onSuccess();
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Request a Seat</h2>
            <p className="text-xs text-slate-500">Trip to {ride.destination}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Request Sent to Driver</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your request for {seatsRequested} seat(s) has been submitted to {ride.driver?.display_name}.
              You will receive an in-app notification once confirmed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Ride Quick Summary */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-700">
                <span className="font-semibold text-slate-900">Driver:</span>
                <span>{ride.driver?.display_name} ({ride.vehicle ? `${ride.vehicle.make} ${ride.vehicle.model}` : 'Verified Vehicle'})</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span className="font-semibold text-slate-900">Departure:</span>
                <span>{ride.travel_date} at {ride.departure_time}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span className="font-semibold text-slate-900">Pickup Location:</span>
                <span className="text-right max-w-[240px] truncate">{ride.pickup_location}</span>
              </div>
              <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-200">
                <span className="font-semibold text-slate-900">Available Capacity:</span>
                <span className="font-mono text-emerald-700 font-bold">{ride.available_seats} of {ride.total_seats} seats free</span>
              </div>
            </div>

            {/* Seats Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Number of Seats Needed
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4]
                  .filter((num) => num <= ride.available_seats)
                  .map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSeatsRequested(num)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                        seatsRequested === num
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {num} {num === 1 ? 'Seat' : 'Seats'}
                    </button>
                  ))}
              </div>
            </div>

            {/* Total Fare Breakdown */}
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-emerald-900 font-semibold block">Total Estimated Shared Cost</span>
                <span className="text-slate-500 text-[11px]">
                  ${ride.price_per_seat.toFixed(2)} × {seatsRequested} passenger{seatsRequested > 1 ? 's' : ''}
                </span>
              </div>
              <span className="text-xl font-bold font-mono tabular-nums text-emerald-800">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            {/* Note to Driver */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Pickup Note or Luggage Details (Optional)
              </label>
              <input
                type="text"
                value={pickupNote}
                onChange={(e) => setPickupNote(e.target.value)}
                placeholder="e.g. Carrying 1 backpack; will wait by north entrance"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || ride.available_seats === 0}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 transition-colors shadow-xs"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
