import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Car,
  Mail,
  Phone,
  Building,
  CheckCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { Profile, Vehicle } from '../types';
import { store } from '../lib/store';

interface ProfilePageProps {
  currentUser: Profile;
  onOpenVerification?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, onOpenVerification }) => {
  const [displayName, setDisplayName] = useState(currentUser.display_name);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [collegeOrOrg, setCollegeOrOrg] = useState(currentUser.college_or_org || '');
  const [role, setRole] = useState(currentUser.role);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Vehicle form modal state
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2023);
  const [color, setColor] = useState('');
  const [plate, setPlate] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [fuelType, setFuelType] = useState<'electric' | 'hybrid' | 'gasoline'>('hybrid');

  const vehicles = store.getVehiclesByOwner(currentUser.id);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateProfile({
      display_name: displayName,
      phone,
      bio,
      college_or_org: collegeOrOrg,
      role,
    });
    setStatusMessage('Profile information saved.');
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleSimulateVerification = (status: 'verified' | 'pending' | 'rejected') => {
    store.updateProfile({ verification_status: status });
    setStatusMessage(`Verification status set to: ${status}`);
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!make.trim() || !model.trim()) return;

    store.addVehicle({
      make: make.trim(),
      model: model.trim(),
      year,
      color: color.trim() || 'Silver',
      license_plate_masked: plate ? `${plate.substring(0, 3)}•••${plate.slice(-1)}` : '7XY•••9',
      passenger_capacity: capacity,
      fuel_type: fuelType,
    });

    setShowAddVehicle(false);
    setMake('');
    setModel('');
    setStatusMessage('Vehicle added to your account.');
    setTimeout(() => setStatusMessage(null), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account Profile & Trust</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your verified campus credentials, commuter preferences, and vehicle details
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Verification & Trust Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-center">
            <img
              src={
                currentUser.avatar_url ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
              }
              alt={currentUser.display_name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-emerald-600/30"
            />
            <div>
              <div className="flex items-center justify-center gap-1.5">
                <h2 className="text-lg font-bold text-slate-900">{currentUser.display_name}</h2>
                {currentUser.verification_status === 'verified' && (
                  <span title="Verified Campus Identity">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">{currentUser.email}</p>
            </div>

            {/* Verification Status Banner */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left text-xs space-y-3">
              <div className="font-semibold text-slate-900 flex items-center justify-between">
                <span>Driver Verification</span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded capitalize ${
                    currentUser.verification_status === 'verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : currentUser.verification_status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {currentUser.verification_status === 'pending'
                    ? 'Pending Review'
                    : currentUser.verification_status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Verification requires official institutional ID or driver licence upload review before
                a verified badge is awarded to passengers.
              </p>

              {onOpenVerification && (
                <button
                  type="button"
                  onClick={onOpenVerification}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {currentUser.verification_status === 'verified'
                      ? 'View Submitted Documents'
                      : currentUser.verification_status === 'pending'
                      ? 'Update Submitted Application'
                      : 'Submit Verification Form'}
                  </span>
                </button>
              )}

              {/* Hackathon Sandbox: Verification Simulator */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Sandbox Test:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSimulateVerification('verified')}
                    className="text-emerald-700 font-semibold hover:underline"
                  >
                    Set Verified
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={() => handleSimulateVerification('pending')}
                    className="text-amber-700 font-semibold hover:underline"
                  >
                    Set Pending
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={() => handleSimulateVerification('rejected')}
                    className="text-rose-700 font-semibold hover:underline"
                  >
                    Set Rejected
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Registered Vehicles */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Your Vehicles</h3>
              <button
                onClick={() => setShowAddVehicle(true)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Vehicle</span>
              </button>
            </div>

            {vehicles.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No vehicles registered yet.</p>
            ) : (
              <div className="space-y-2">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1"
                  >
                    <div className="font-bold text-slate-900">
                      {v.make} {v.model} ({v.year})
                    </div>
                    <div className="text-slate-500 flex items-center gap-2">
                      <span>{v.passenger_capacity} seats</span>
                      <span>·</span>
                      <span className="capitalize">{v.fuel_type}</span>
                      <span>·</span>
                      <span>Plate: {v.license_plate_masked}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Edit Profile Details Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Profile Information
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Full Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Mobile Phone (Masked)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Campus or Organization Affiliation
              </label>
              <input
                type="text"
                value={collegeOrOrg}
                onChange={(e) => setCollegeOrOrg(e.target.value)}
                placeholder="e.g. University Innovation Campus, Department of CS"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Commute Bio & Preferences
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Primary Participation Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
              >
                <option value="both">Both Driver & Passenger</option>
                <option value="driver">Driver Only</option>
                <option value="passenger">Passenger Only</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {showAddVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Vehicle to Account</h3>
            <form onSubmit={handleAddVehicle} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Make</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Toyota, Honda, Tesla"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Model</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prius Prime, Civic, Model 3"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Year</label>
                  <input
                    type="number"
                    min="1995"
                    max="2027"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Passenger Seats</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Color</label>
                  <input
                    type="text"
                    placeholder="e.g. Silver"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Fuel Type</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                  >
                    <option value="hybrid">Hybrid</option>
                    <option value="electric">Electric</option>
                    <option value="gasoline">Gasoline</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  License Plate (Will be Masked Publicly)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 7XYZ899"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddVehicle(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Add Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
