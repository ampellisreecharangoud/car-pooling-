import React from 'react';
import { Compass, Users, DollarSign, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface HowItWorksPageProps {
  onNavigate: (page: string) => void;
  onOpenCostCalc?: () => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate, onOpenCostCalc }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Intro */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
          Operating Model & Protocol
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Smarter Journeys on Shared Corridors
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          RideMate AI bridges commuters travelling along common routes. Learn how discovery,
          seat allocation, and non-profit cost sharing operate together.
        </p>
      </div>

      {/* Two Column comparison: For Drivers vs For Passengers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* For Passengers */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">For Passengers</h2>
              <p className="text-xs text-slate-500">Effortless discovery & guaranteed seats</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-600">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-900 font-bold flex items-center justify-center shrink-0">1</span>
              <div>
                <strong className="text-slate-900 block text-xs mb-0.5">Enter Corridor Search</strong>
                Input your campus gate or neighborhood and destination. Our matching engine sorts rides by proximity to your pickup.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-900 font-bold flex items-center justify-center shrink-0">2</span>
              <div>
                <strong className="text-slate-900 block text-xs mb-0.5">Submit Seat Reservation</strong>
                Select the exact number of seats needed and provide an optional pickup note for the driver.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-900 font-bold flex items-center justify-center shrink-0">3</span>
              <div>
                <strong className="text-slate-900 block text-xs mb-0.5">Meet & Share Cost</strong>
                Meet at the agreed public campus transit stop. Settle your direct fuel contribution directly without commission cuts.
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('find-rides')}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>Search Rides Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* For Drivers */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">For Drivers</h2>
              <p className="text-xs text-slate-500">Turn empty car seats into shared savings</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-600">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-900 font-bold flex items-center justify-center shrink-0">1</span>
              <div>
                <strong className="text-slate-900 block text-xs mb-0.5">Publish Routine Route</strong>
                Specify your departure time, capacity, and route waypoints. The cost helper computes a recommended non-commercial rate.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-900 font-bold flex items-center justify-center shrink-0">2</span>
              <div>
                <strong className="text-slate-900 block text-xs mb-0.5">Review Booking Requests</strong>
                View passenger campus affiliations and review requests. You have complete autonomy over who joins your vehicle.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-900 font-bold flex items-center justify-center shrink-0">3</span>
              <div>
                <strong className="text-slate-900 block text-xs mb-0.5">Recover Real Trip Expenses</strong>
                Offset parking permits, tolls, and monthly fuel costs while helping reduce university campus parking bottlenecks.
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('offer-ride')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>Offer Your Seats</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Fair Cost Math Callout */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-lg font-bold">Transparent Non-Profit Cost Formula</h3>
          <p className="text-xs text-slate-300 max-w-xl">
            RideMate strictly enforces cost recovery. Formula: Shareable Trip Cost = Fuel + Vehicle Maintenance + Tolls.
            Cost per passenger = Shareable Cost ÷ Total Participants.
          </p>
        </div>
        {onOpenCostCalc && (
          <button
            onClick={onOpenCostCalc}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Open Interactive Calculator
          </button>
        )}
      </div>
    </div>
  );
};
