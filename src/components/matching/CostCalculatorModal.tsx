import React, { useState } from 'react';
import { X, Calculator, HelpCircle, Check, DollarSign } from 'lucide-react';

interface CostCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTripCost?: number;
}

export const CostCalculatorModal: React.FC<CostCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialTripCost = 18.0,
}) => {
  const [distanceMiles, setDistanceMiles] = useState<number>(24);
  const [fuelCostPerGallon, setFuelCostPerGallon] = useState<number>(3.85);
  const [vehicleMpg, setVehicleMpg] = useState<number>(32);
  const [tollAndParking, setTollAndParking] = useState<number>(4.0);
  const [passengerSeats, setPassengerSeats] = useState<number>(3);
  const [driverContributionPct, setDriverContributionPct] = useState<number>(25);

  if (!isOpen) return null;

  // Fuel calculation
  const fuelCost = (distanceMiles / vehicleMpg) * fuelCostPerGallon;
  const wearAndTearEstimate = distanceMiles * 0.12; // IRS marginal maintenance estimate
  const totalTripCost = fuelCost + wearAndTearEstimate + tollAndParking;

  // Total participants = driver (1) + passengers (passengerSeats)
  const totalParticipants = passengerSeats + 1;

  // Driver share (by default pays equal share or custom percentage)
  const driverShareAmount = (totalTripCost * driverContributionPct) / 100;
  const poolForPassengers = Math.max(0, totalTripCost - driverShareAmount);
  const costPerPassenger = passengerSeats > 0 ? poolForPassengers / passengerSeats : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Fair Cost-Sharing Calculator</h2>
              <p className="text-xs text-slate-500">
                Transparent non-profit carpool math based on actual fuel, maintenance & tolls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Result Banner */}
          <div className="bg-slate-900 text-white rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <span className="text-xs text-slate-400 block">Recommended per Seat</span>
              <span className="text-3xl font-bold font-mono tabular-nums text-emerald-400">
                ${costPerPassenger.toFixed(2)}
              </span>
              <span className="text-xs text-slate-300 block mt-0.5">
                for {passengerSeats} passenger{passengerSeats > 1 ? 's' : ''}
              </span>
            </div>
            <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
              <span className="text-xs text-slate-400 block">Total Real Trip Cost</span>
              <span className="text-xl font-bold font-mono tabular-nums text-white">
                ${totalTripCost.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                ${fuelCost.toFixed(2)} fuel + ${wearAndTearEstimate.toFixed(2)} wear + ${tollAndParking.toFixed(2)} tolls
              </span>
            </div>
            <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
              <span className="text-xs text-slate-400 block">Driver Share</span>
              <span className="text-xl font-bold font-mono tabular-nums text-white">
                ${driverShareAmount.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                ({driverContributionPct}% of total cost)
              </span>
            </div>
          </div>

          {/* Interactive Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                One-Way Distance ({distanceMiles} miles)
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="1"
                value={distanceMiles}
                onChange={(e) => setDistanceMiles(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>5 miles</span>
                <span>50 miles</span>
                <span>100 miles</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Passenger Seats Sharing ({passengerSeats} seats)
              </label>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={passengerSeats}
                onChange={(e) => setPassengerSeats(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>1 rider</span>
                <span>3 riders</span>
                <span>6 riders</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Fuel Economy ({vehicleMpg} MPG)
              </label>
              <input
                type="range"
                min="15"
                max="60"
                step="1"
                value={vehicleMpg}
                onChange={(e) => setVehicleMpg(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>15 mpg (SUV)</span>
                <span>32 mpg (Sedan)</span>
                <span>60 mpg (Hybrid)</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Tolls & Parking Estimates ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={tollAndParking}
                  onChange={(e) => setTollAndParking(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Transparent Formula Breakdown */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <span>Transparent Formula Breakdown</span>
            </div>
            <p>
              Under standard carpooling guidelines, drivers do not make commercial profit. RideMate
              fairly shares direct operational costs:
            </p>
            <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1">
              <div>Shareable Cost = Fuel (${fuelCost.toFixed(2)}) + Wear (${wearAndTearEstimate.toFixed(2)}) + Tolls (${tollAndParking.toFixed(2)}) = ${totalTripCost.toFixed(2)}</div>
              <div>Passenger Contribution = [Total Cost − Driver Share (${driverShareAmount.toFixed(2)})] ÷ {passengerSeats} Passengers = <span className="font-bold text-emerald-700">${costPerPassenger.toFixed(2)}/seat</span></div>
            </div>
            <p className="text-[11px] text-slate-500">
              Note: This is an estimated cost-recovery calculation. Personal payment settlements occur directly between participants or according to campus carpool agreements.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
