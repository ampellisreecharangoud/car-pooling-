import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Clock,
  Users,
  MapPin,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Leaf,
  ChevronDown,
  ChevronUp,
  Car,
  Compass,
  CheckCircle,
} from 'lucide-react';
import { SearchCriteria } from '../types';

interface HomePageProps {
  onSearch: (criteria: SearchCriteria) => void;
  onNavigate: (page: string) => void;
  onOpenCostCalc: () => void;
  onOpenSafety: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSearch,
  onNavigate,
  onOpenCostCalc,
  onOpenSafety,
}) => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('2026-10-12');
  const [time, setTime] = useState('08:30');
  const [seats, setSeats] = useState(1);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      pickup,
      destination,
      date,
      departureTime: time,
      seats,
    });
    onNavigate('find-rides');
  };

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const faqs = [
    {
      q: 'How does RideMate AI ensure campus and commuter safety?',
      a: 'We require university institutional email validation or verified workplace profiles. Driver vehicles are listed with verified license plate records, and seats cannot exceed legal vehicle limits. Home addresses remain private, and meetings take place at designated public transit or campus points.',
    },
    {
      q: 'How are shared travel costs calculated?',
      a: 'RideMate is non-profit and cost-recovery oriented. The calculator computes direct trip expenses (estimated fuel and IRS vehicle wear-and-tear) and divides them equally across participants. Drivers cannot mark up fares for commercial profit.',
    },
    {
      q: 'Can I both offer rides and book rides on the same account?',
      a: 'Yes. Every user can seamlessly switch between offering rides when they are driving and booking passenger seats when they prefer not to drive.',
    },
    {
      q: 'What happens if a driver or passenger cancels?',
      a: 'If a driver cancels, all booked passengers receive instant automated notifications, and reserved seats are safely cleared. If a passenger cancels, their reserved seats are immediately returned to the public pool atomically.',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 md:pt-14 pb-12 bg-gradient-to-b from-slate-100/70 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Headlines & Search Form */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
                <span>Smart Campus & Commuter Carpooling</span>
                <span>·</span>
                <span>Zero Commercial Markup</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Your Journey Is Better <br className="hidden sm:inline" />
                <span className="text-emerald-700">When Shared.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Find people travelling your way, share ride costs fairly, and make everyday campus
                and workplace commutes more convenient and sustainable.
              </p>

              {/* Interactive Search Box */}
              <form
                onSubmit={handleHeroSearch}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md space-y-4 max-w-xl"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Pickup */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Pickup Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="e.g. Campus Student Union"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
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
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Time</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Seats</label>
                    <select
                      value={seats}
                      onChange={(e) => setSeats(Number(e.target.value))}
                      className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
                    >
                      <option value={1}>1 Seat</option>
                      <option value={2}>2 Seats</option>
                      <option value={3}>3 Seats</option>
                      <option value={4}>4 Seats</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    className="w-full sm:flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Search className="w-4 h-4" />
                    <span>Find a Ride</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('offer-ride')}
                    className="w-full sm:w-auto py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Car className="w-4 h-4" />
                    <span>Offer a Ride</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Hero Visual Asset */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900 aspect-16/10">
                <img
                  src="/src/assets/images/hero_mobility_carpool_1791604082404.jpg"
                  alt="Students and commuters enjoying a shared carpool ride"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="text-xs font-semibold text-emerald-400">Verified Campus Community</div>
                  <div className="text-sm font-bold text-white">
                    One Route. Shared Rides. Smarter Journeys.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-COLUMN TRUST & ADVANTAGE STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <DollarSign className="w-5 h-5 text-emerald-600 mb-2" />
            <h3 className="font-bold text-slate-900 text-sm">Save 50% to 75%</h3>
            <p className="text-xs text-slate-500 mt-1">
              Split direct fuel and tolls mathematically without commercial surge pricing.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mb-2" />
            <h3 className="font-bold text-slate-900 text-sm">Verified Profiles</h3>
            <p className="text-xs text-slate-500 mt-1">
              Campus and enterprise identity verification with transparent vehicle details.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <Leaf className="w-5 h-5 text-emerald-600 mb-2" />
            <h3 className="font-bold text-slate-900 text-sm">Lower Emissions</h3>
            <p className="text-xs text-slate-500 mt-1">
              Fill empty seats to take duplicate single-occupancy vehicles off congested roads.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <CheckCircle className="w-5 h-5 text-emerald-600 mb-2" />
            <h3 className="font-bold text-slate-900 text-sm">Atomic Seat Locks</h3>
            <p className="text-xs text-slate-500 mt-1">
              Guaranteed zero-overbooking transactional engine protecting seat reservations.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
            Simple 3-Step Journey
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            How RideMate AI Coordinates Shared Travel
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Engineered specifically for daily routes, campus corridors, and regular commute schedules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 relative">
            <div className="text-2xl font-black font-mono text-emerald-600 mb-3">01</div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Search or Post a Route</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your pickup spot and destination. Our intelligent matching engine evaluates pickup proximity, time delta, and intermediate stops.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 relative">
            <div className="text-2xl font-black font-mono text-emerald-600 mb-3">02</div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Request & Confirm Seats</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              View vehicle details, driver verification, and route previews. Reserve seats with atomic concurrency protection and instant driver notification.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 relative">
            <div className="text-2xl font-black font-mono text-emerald-600 mb-3">03</div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Share Direct Costs Fairly</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Meet at convenient public transit gates. Divide fuel and tolls using our transparent cost-sharing formula without platform commission cuts.
            </p>
          </div>
        </div>
      </section>

      {/* ROUTE INTELLIGENCE & MAP SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 text-white p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                Algorithmic Route Compatibility
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Intelligent Corridor Matching, Not Arbitrary Guesswork
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Standard apps struggle when routes cross midway. RideMate evaluates waypoint
                proximity, intermediate pickup gates, and schedule alignment, showing exact match
                reasons for every trip.
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  onClick={() => onNavigate('find-rides')}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>Explore Available Routes</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onOpenCostCalc}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition-colors"
                >
                  Open Cost Calculator
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl overflow-hidden border border-slate-800 aspect-4/3 bg-slate-950">
                <img
                  src="/src/assets/images/route_map_preview_1791604096035.jpg"
                  alt="Intelligent urban carpool matching corridor preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SAFETY & COMMUNITY FOCUS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md aspect-4/3">
              <img
                src="/src/assets/images/safety_verified_community_1791604107217.jpg"
                alt="Verified university students sharing a safe commute"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4 order-1 lg:order-2">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
              Safety First Design
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Built on Mutual Accountability & Privacy
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Carpooling works when participants trust each other. We enforce institutional
              verification, mask personal residential coordinates, and give drivers full control over
              who joins their vehicle.
            </p>

            <div className="space-y-3 pt-2 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Driver vehicle registrations reviewed before verified badges are granted</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Masked license plate previews and public hub meeting spots</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Clear non-commercial cost recovery compliance</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenSafety}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-semibold text-xs rounded-lg transition-colors"
              >
                Review Full Safety Protocols
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500 mt-1">Clear answers on how the platform operates</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = faqOpen === index;
            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-sm text-slate-900 hover:bg-slate-50/50"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
