/**
 * ==============================================================================
 * Project: Lifeline - Smart Emergency Ambulance Dispatch & Routing System
 * Component: NewUserModal.tsx ((New User) Registration & Provisioning Hub)
 * Enforces: Only Platform Administrators can add new Platform Administrators
 * ==============================================================================
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, UserProfile } from '../types';
import {
  X,
  UserPlus,
  Shield,
  HeartPulse,
  Siren,
  Radio,
  Building2,
  Lock,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Key
} from 'lucide-react';

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPlatformAdmin?: boolean;
}

export const NewUserModal: React.FC<NewUserModalProps> = ({
  isOpen,
  onClose,
  isPlatformAdmin = false
}) => {
  const { addUser, hospitals, currentUser } = useApp();

  const isCurrentAdmin =
    isPlatformAdmin ||
    currentUser?.role === 'Platform Administrator' ||
    currentUser?.role === 'Admin' ||
    currentUser?.role === 'System Administrator';

  const [role, setRole] = useState<UserRole>('Citizen');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [showAdminBlockedWarning, setShowAdminBlockedWarning] = useState(false);

  // Role-specific fields
  const [bloodType, setBloodType] = useState('O Positive (O+)');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [assignedVehicle, setAssignedVehicle] = useState('MH-04-AZ-1024');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [operatorCode, setOperatorCode] = useState('EOC-7708');
  const [affiliatedHospital, setAffiliatedHospital] = useState(
    hospitals[0]?.name || 'Bhaktivedanta Hospital & Research Institute'
  );
  const [clearanceLevel, setClearanceLevel] = useState<'Super Admin' | 'Fleet Manager' | 'System Auditor'>(
    'Super Admin'
  );
  const [adminSecretKey, setAdminSecretKey] = useState('EMS-ROOT-2025');

  if (!isOpen) return null;

  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setPhone(clean);
    setPhoneError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (!/^\d{10}$/.test(phone)) {
      setPhoneError('Phone number must be only whole numbers and exactly 10 digits.');
      return;
    }

    // Security check: Only an existing Platform Administrator can add a Platform Administrator
    if (role === 'Platform Administrator' && !isCurrentAdmin) {
      setShowAdminBlockedWarning(true);
      return;
    }

    const newUserPayload: Omit<UserProfile, 'id'> = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone,
      role,
      isActive: true,
      ...(role === 'Citizen'
        ? {
            bloodType,
            emergencyContactName: emergencyContactName.trim() || 'Primary Contact',
            emergencyContactPhone: emergencyContactPhone.replace(/\D/g, '').slice(0, 10) || phone
          }
        : {}),
      ...(role === 'Ambulance Operator'
        ? {
            assignedVehicleNumber: assignedVehicle,
            licenseNumber: licenseNumber.trim() || 'MH-04-2024-998811',
            shiftStatus: 'on-duty'
          }
        : {}),
      ...(role === 'Emergency Coordinator'
        ? {
            operatorCode: operatorCode.trim() || 'EOC-7708',
            cadShift: 'Morning (06:00 - 14:00)'
          }
        : {}),
      ...(role === 'Healthcare Coordinator'
        ? {
            affiliatedHospitalName: affiliatedHospital,
            department: 'Emergency & Trauma Care'
          }
        : {}),
      ...(role === 'Platform Administrator'
        ? {
            clearanceLevel,
            adminSecretKey,
            canManageFleet: true,
            canManageUsers: true
          }
        : {})
    };

    addUser(newUserPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-splash-in max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                  (New User) Registration Hub
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  ENROLLMENT
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {isCurrentAdmin
                  ? 'Platform Administrator Mode: You have full clearance to add ANY user including Platform Administrators.'
                  : 'Enroll new Citizen, Driver, CAD Dispatcher or Healthcare user.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Security Banner if not admin */}
          {!isCurrentAdmin && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-950 font-bold">Platform Administrator Security Rule:</strong>
                <span>
                  You can register Citizen, Ambulance Operator, Emergency Coordinator, or Healthcare Coordinator.
                  <strong> Only an existing Platform Administrator can add a new Platform Administrator.</strong>
                </span>
              </div>
            </div>
          )}

          {/* Admin Blocked Warning */}
          {showAdminBlockedWarning && !isCurrentAdmin && (
            <div className="p-3.5 rounded-2xl bg-purple-50 border-2 border-purple-300 text-purple-950 text-xs space-y-2 animate-splash-in">
              <div className="flex items-center gap-2 font-bold text-xs text-purple-900">
                <Lock className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Restricted: Platform Administrator Provisioning</span>
              </div>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                Only an existing <strong>Platform Administrator</strong> can add a new Platform Administrator.
                Please choose one of the allowable public roles below (Citizen, Ambulance Operator, Emergency Coordinator, or Healthcare Coordinator).
              </p>
              <button
                type="button"
                onClick={() => {
                  setRole('Citizen');
                  setShowAdminBlockedWarning(false);
                }}
                className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Select Citizen Instead
              </button>
            </div>
          )}

          {/* 1. ROLE PICKER */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              1. Select Role to Enroll
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {/* 1. Citizen */}
              <button
                type="button"
                onClick={() => {
                  setRole('Citizen');
                  setShowAdminBlockedWarning(false);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                  role === 'Citizen'
                    ? 'bg-rose-50 border-rose-600 ring-2 ring-rose-500/30'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <HeartPulse className="w-4 h-4 text-rose-600" />
                  {role === 'Citizen' && <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />}
                </div>
                <div>
                  <strong className="block text-slate-900 text-xs">Citizen</strong>
                  <span className="text-[10px] text-rose-600 font-medium">SOS Patient</span>
                </div>
              </button>

              {/* 2. Ambulance Operator */}
              <button
                type="button"
                onClick={() => {
                  setRole('Ambulance Operator');
                  setShowAdminBlockedWarning(false);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                  role === 'Ambulance Operator'
                    ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/30'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Siren className="w-4 h-4 text-emerald-600" />
                  {role === 'Ambulance Operator' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <div>
                  <strong className="block text-slate-900 text-xs truncate">Operator</strong>
                  <span className="text-[10px] text-emerald-600 font-medium">Driver & Crew</span>
                </div>
              </button>

              {/* 3. Emergency Coordinator */}
              <button
                type="button"
                onClick={() => {
                  setRole('Emergency Coordinator');
                  setShowAdminBlockedWarning(false);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                  role === 'Emergency Coordinator'
                    ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/30'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Radio className="w-4 h-4 text-blue-600" />
                  {role === 'Emergency Coordinator' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <div>
                  <strong className="block text-slate-900 text-xs truncate">Coordinator</strong>
                  <span className="text-[10px] text-blue-600 font-medium">Dispatcher</span>
                </div>
              </button>

              {/* 4. Healthcare Coordinator */}
              <button
                type="button"
                onClick={() => {
                  setRole('Healthcare Coordinator');
                  setShowAdminBlockedWarning(false);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                  role === 'Healthcare Coordinator'
                    ? 'bg-teal-50 border-teal-600 ring-2 ring-teal-500/30'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  {role === 'Healthcare Coordinator' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                </div>
                <div>
                  <strong className="block text-slate-900 text-xs truncate">Healthcare</strong>
                  <span className="text-[10px] text-teal-600 font-medium">Hospital Admin</span>
                </div>
              </button>

              {/* 5. Platform Administrator */}
              {isCurrentAdmin ? (
                <button
                  type="button"
                  onClick={() => setRole('Platform Administrator')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                    role === 'Platform Administrator'
                      ? 'bg-purple-50 border-purple-600 ring-2 ring-purple-500/30'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Shield className="w-4 h-4 text-purple-600" />
                    {role === 'Platform Administrator' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                  </div>
                  <div>
                    <strong className="block text-slate-900 text-xs truncate">Platform Admin</strong>
                    <span className="text-[10px] text-purple-600 font-medium">Root Access</span>
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAdminBlockedWarning(true)}
                  className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/70 text-left transition-all cursor-pointer flex flex-col justify-between h-20 relative"
                  title="Only an existing Platform Administrator can add a new Platform Administrator"
                >
                  <div className="flex items-center justify-between">
                    <Shield className="w-4 h-4 text-purple-500" />
                    <Lock className="w-3 h-3 text-purple-600" />
                  </div>
                  <div>
                    <strong className="block text-purple-900 text-xs truncate">Platform Admin</strong>
                    <span className="text-[9px] text-purple-700 font-semibold">Admin-Only</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* 2. BASIC PROFILE DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Official Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@lifeline.in"
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Phone with 10 digits validator */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">10-Digit Mobile Phone *</label>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border transition-colors ${
                  phone.length === 10
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : phone.length > 0
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                {phone.length === 10 ? '✓ 10 Digits Valid' : `${phone.length}/10 digits`}
              </span>
            </div>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              required
              value={phone}
              onChange={e => handlePhoneChange(e.target.value)}
              placeholder="e.g. 9820012345"
              className={`w-full border rounded-xl p-2.5 text-xs font-mono tracking-wider focus:outline-none focus:ring-2 ${
                phoneError
                  ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                  : phone.length === 10
                  ? 'border-emerald-300 focus:ring-emerald-500 bg-emerald-50/10'
                  : 'border-slate-200 focus:ring-emerald-500'
              }`}
            />
            {phoneError && (
              <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {phoneError}
              </p>
            )}
          </div>

          {/* 3. ROLE-SPECIFIC ATTRIBUTES */}
          {role === 'Citizen' && (
            <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-rose-700 block">Citizen Medical Profile</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Blood Group</label>
                  <select
                    value={bloodType}
                    onChange={e => setBloodType(e.target.value)}
                    className="w-full bg-white border border-rose-200 rounded-lg p-2 text-xs"
                  >
                    <option value="O Positive (O+)">O Positive (O+)</option>
                    <option value="O Negative (O-)">O Negative (O-)</option>
                    <option value="A Positive (A+)">A Positive (A+)</option>
                    <option value="B Positive (B+)">B Positive (B+)</option>
                    <option value="AB Positive (AB+)">AB Positive (AB+)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={e => setEmergencyContactName(e.target.value)}
                    placeholder="e.g. Spouse / Parent"
                    className="w-full bg-white border border-rose-200 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {role === 'Ambulance Operator' && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Ambulance Fleet Details</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Assigned Vehicle</label>
                  <input
                    type="text"
                    value={assignedVehicle}
                    onChange={e => setAssignedVehicle(e.target.value)}
                    placeholder="MH-04-AZ-1024"
                    className="w-full bg-white border border-emerald-200 rounded-lg p-2 text-xs font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Commercial License</label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={e => setLicenseNumber(e.target.value)}
                    placeholder="MH-04-2024-XXXX"
                    className="w-full bg-white border border-emerald-200 rounded-lg p-2 text-xs font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          )}

          {role === 'Emergency Coordinator' && (
            <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
              <span className="text-[10px] uppercase font-bold text-blue-700 block">CAD Dispatcher Code</span>
              <input
                type="text"
                value={operatorCode}
                onChange={e => setOperatorCode(e.target.value)}
                placeholder="EOC-7708"
                className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs font-mono uppercase"
              />
            </div>
          )}

          {role === 'Healthcare Coordinator' && (
            <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-2">
              <span className="text-[10px] uppercase font-bold text-teal-700 block">Affiliated Hospital</span>
              <select
                value={affiliatedHospital}
                onChange={e => setAffiliatedHospital(e.target.value)}
                className="w-full bg-white border border-teal-200 rounded-lg p-2 text-xs font-semibold"
              >
                {hospitals.map(h => (
                  <option key={h.id} value={h.name}>{h.name}</option>
                ))}
              </select>
            </div>
          )}

          {role === 'Platform Administrator' && isCurrentAdmin && (
            <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-purple-900 font-bold">
                <Shield className="w-4 h-4 text-purple-700" />
                <span>Authorized Platform Administrator Provisioning</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Clearance Level</label>
                  <select
                    value={clearanceLevel}
                    onChange={e => setClearanceLevel(e.target.value as any)}
                    className="w-full bg-white border border-purple-200 rounded-lg p-2 text-xs font-semibold"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Fleet Manager">Fleet Manager</option>
                    <option value="System Auditor">System Auditor</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Master Admin Secret Key</label>
                  <input
                    type="text"
                    value={adminSecretKey}
                    onChange={e => setAdminSecretKey(e.target.value)}
                    placeholder="EMS-ROOT-2025"
                    className="w-full bg-white border border-purple-200 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer shadow-md transition-all active:scale-95"
            >
              Enroll User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
