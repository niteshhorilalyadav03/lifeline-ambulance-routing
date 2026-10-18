/**
 * ==============================================================================
 * Project: Lifeline - Smart Emergency Ambulance Dispatch & Routing System
 * Component: AdminDash.tsx (Master Administrative Control Panel & CRUD Hub)
 * Role: Platform Administrator
 * ==============================================================================
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile, UserRole, Ambulance, Hospital, EmergencyRequest } from '../types';
import {
  Shield,
  Users,
  Siren,
  Building2,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  AlertCircle,
  Radio,
  Fuel,
  Activity,
  X,
  Save,
  Check,
  Download,
  FileText,
  Database,
  ShieldAlert,
  Key,
  Phone,
  HeartPulse,
  Clock,
  Filter,
  Eye,
  RefreshCw,
  AlertTriangle,
  Stethoscope,
  ChevronRight,
  UserCheck
} from 'lucide-react';

export const AdminDash: React.FC = () => {
  const {
    currentUser,
    users,
    ambulances,
    hospitals,
    emergencyRequests,
    notifications,
    doctors,
    addUser,
    updateUser,
    deleteUser,
    addAmbulance,
    updateAmbulance,
    deleteAmbulance,
    addHospital,
    updateHospital,
    deleteHospital
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all-data' | 'users' | 'fleet' | 'hospitals' | 'incidents' | 'audit'>('all-data');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  // Modals state
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);
  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  // User form state (Comprehensive for all 5 roles)
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Emergency Coordinator');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [userPhoneError, setUserPhoneError] = useState<string | null>(null);

  // Role-specific fields
  const [newBloodType, setNewBloodType] = useState('O Positive (O+)');
  const [newEmergencyContactName, setNewEmergencyContactName] = useState('');
  const [newEmergencyContactPhone, setNewEmergencyContactPhone] = useState('');
  const [newAssignedVehiclePlate, setNewAssignedVehiclePlate] = useState('MH-04-AZ-1024');
  const [newLicenseNumber, setNewLicenseNumber] = useState('');
  const [newOperatorCode, setNewOperatorCode] = useState('EOC-7708');
  const [newAffiliatedHospital, setNewAffiliatedHospital] = useState('Bhaktivedanta Hospital & Research Institute');
  const [newAdminClearance, setNewAdminClearance] = useState<'Super Admin' | 'Fleet Manager' | 'System Auditor'>('Super Admin');
  const [newAdminSecretKey, setNewAdminSecretKey] = useState('EMS-ROOT-2025');

  // Edit user modal state
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState<UserRole>('Emergency Coordinator');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editPhoneError, setEditPhoneError] = useState<string | null>(null);

  // Ambulance form state
  const [newPlate, setNewPlate] = useState('MH-04-XX-0000');
  const [newDriver, setNewDriver] = useState('');
  const [newContact, setNewContact] = useState('');
  const [ambulanceContactError, setAmbulanceContactError] = useState<string | null>(null);
  const [newType, setNewType] = useState('Advanced Life Support');
  const [newLandmark, setNewLandmark] = useState('Mira Road Base Hub');
  const [newLat, setNewLat] = useState('19.2815');
  const [newLon, setNewLon] = useState('72.8558');

  // Hospital form state
  const [newHospName, setNewHospName] = useState('');
  const [newHospAddress, setNewHospAddress] = useState('');
  const [newHospHotline, setNewHospHotline] = useState('022-');
  const [newHospBeds, setNewHospBeds] = useState(6);
  const [newHospTrauma, setNewHospTrauma] = useState(true);

  // Notification alert
  const [alertNote, setAlertNote] = useState<string | null>(null);

  const showAlert = (msg: string) => {
    setAlertNote(msg);
    setTimeout(() => setAlertNote(null), 3500);
  };

  // Input sanitizer: only whole numbers (0-9) and max 10 digits
  const handlePhoneInputChange = (
    val: string,
    setter: (val: string) => void,
    errorSetter: (err: string | null) => void
  ) => {
    const wholeNumbersOnly = val.replace(/\D/g, '').slice(0, 10);
    setter(wholeNumbersOnly);
    errorSetter(null);
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      !/[0-9]/.test(e.key) &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key) &&
      !e.ctrlKey &&
      !e.metaKey
    ) {
      e.preventDefault();
    }
  };

  // Handlers
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    if (!/^\d{10}$/.test(newUserPhone)) {
      setUserPhoneError('Phone number must be only whole numbers and exactly 10 digits.');
      return;
    }

    const userData: Omit<UserProfile, 'id'> = {
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      phone: newUserPhone,
      isActive: true,
      ...(newUserRole === 'Citizen' ? {
        bloodType: newBloodType,
        emergencyContactName: newEmergencyContactName || 'Family Member',
        emergencyContactPhone: newEmergencyContactPhone.replace(/\D/g, '').slice(0, 10)
      } : {}),
      ...(newUserRole === 'Ambulance Operator' ? {
        assignedVehicleNumber: newAssignedVehiclePlate,
        licenseNumber: newLicenseNumber || 'MH-04-2024-998811',
        shiftStatus: 'on-duty'
      } : {}),
      ...(newUserRole === 'Emergency Coordinator' ? {
        operatorCode: newOperatorCode,
        cadShift: 'Morning (06:00 - 14:00)'
      } : {}),
      ...(newUserRole === 'Healthcare Coordinator' ? {
        affiliatedHospitalName: newAffiliatedHospital,
        department: 'Emergency & Trauma Care'
      } : {}),
      ...(newUserRole === 'Platform Administrator' ? {
        clearanceLevel: newAdminClearance,
        adminSecretKey: newAdminSecretKey,
        canManageFleet: true,
        canManageUsers: true
      } : {})
    };

    addUser(userData);

    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setUserPhoneError(null);
    setShowUserModal(false);
    showAlert(`User ${newUserName} added successfully with role ${newUserRole}.`);
  };

  const handleStartEditUser = (user: UserProfile) => {
    setEditingUserId(user.id);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserRole(user.role);
    setEditUserPhone((user.phone || '').replace(/\D/g, '').slice(0, 10));
    setEditPhoneError(null);
    setShowEditUserModal(true);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId || !editUserName.trim() || !editUserEmail.trim()) return;

    if (!/^\d{10}$/.test(editUserPhone)) {
      setEditPhoneError('Phone number must be only whole numbers and exactly 10 digits.');
      return;
    }

    updateUser(editingUserId, {
      name: editUserName.trim(),
      email: editUserEmail.trim(),
      role: editUserRole,
      phone: editUserPhone
    });

    setShowEditUserModal(false);
    setEditingUserId(null);
    showAlert(`User ${editUserName} updated successfully.`);
  };

  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    deleteUser(userToDelete.id);
    showAlert(`User account for ${userToDelete.name} (${userToDelete.role}) was permanently deleted.`);
    setUserToDelete(null);
  };

  const handleCreateAmbulance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate || !newDriver) return;

    if (newContact && !/^\d{10}$/.test(newContact)) {
      setAmbulanceContactError('Driver contact phone must be only whole numbers and exactly 10 digits.');
      return;
    }

    const newId = `AMB-00${ambulances.length + 1}`;
    addAmbulance({
      id: newId,
      vehicle_number: newPlate.toUpperCase(),
      driver_name: newDriver,
      contact: newContact || '9820112345',
      status: 'available',
      current_location: {
        latitude: parseFloat(newLat) || 19.2815,
        longitude: parseFloat(newLon) || 72.8558,
        landmark: newLandmark
      },
      type: newType,
      equipment: ['Oxygen Cylinder', 'First Aid', 'Defibrillator', 'Multi-Para Monitor'],
      base_station: newLandmark,
      fuel_level: '95%'
    });

    setNewPlate('');
    setNewDriver('');
    setNewContact('');
    setAmbulanceContactError(null);
    setShowAmbulanceModal(false);
    showAlert(`Ambulance unit ${newPlate} registered.`);
  };

  const handleCreateHospital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHospName) return;

    const newId = `HOSP-00${hospitals.length + 1}`;
    addHospital({
      id: newId,
      name: newHospName,
      address: newHospAddress || 'Mira Road East, Thane 401107',
      location: { latitude: 19.285, longitude: 72.86 },
      emergency_contact: newHospHotline,
      icu_beds_available: Number(newHospBeds),
      general_beds_available: 20,
      has_trauma_center: newHospTrauma
    });

    setNewHospName('');
    setNewHospAddress('');
    setShowHospitalModal(false);
    showAlert(`Hospital ${newHospName} added to dispatch network.`);
  };

  // ==========================================================================
  // EXPORT SYSTEM DATA (CSV & JSON)
  // ==========================================================================
  const handleExportFullJSON = () => {
    const fullDataset = {
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser?.name || 'Platform Administrator',
      summary: {
        totalUsers: users.length,
        totalFleet: ambulances.length,
        totalHospitals: hospitals.length,
        totalDoctors: doctors.length,
        totalIncidents: emergencyRequests.length
      },
      users,
      ambulances,
      hospitals,
      doctors,
      emergencyRequests,
      auditLogs: notifications
    };

    const blob = new Blob([JSON.stringify(fullDataset, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lifeline-master-system-dataset-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showAlert('Complete master dataset JSON downloaded.');
  };

  const handleExportUsersCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'Phone', 'Created_At', 'Identifier'];
    const rows = users.map(u => [
      `"${u.id}"`,
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.role}"`,
      `"${u.phone}"`,
      `"${u.createdAt || 'Active'}"`,
      `"${u.assignedVehicleNumber || u.operatorCode || u.clearanceLevel || u.bloodType || ''}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lifeline-users-dataset-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showAlert('Users CSV exported successfully.');
  };

  const handleExportIncidentsCSV = () => {
    const headers = ['Incident_ID', 'Caller_Name', 'Caller_Phone', 'Emergency_Type', 'Priority', 'Landmark', 'Status', 'Assigned_Ambulance'];
    const rows = emergencyRequests.map(r => [
      `"${r.id}"`,
      `"${r.callerName}"`,
      `"${r.callerPhone}"`,
      `"${r.emergencyType}"`,
      `"${r.priority}"`,
      `"${r.location.landmark}"`,
      `"${r.status}"`,
      `"${r.assignedAmbulancePlate || r.assignedAmbulanceId || 'None'}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lifeline-cad-incidents-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showAlert('Emergency CAD incidents CSV exported.');
  };

  // Metrics
  const availableUnits = ambulances.filter(a => a.status === 'available').length;
  const busyUnits = ambulances.filter(a => a.status === 'busy').length;
  const totalIcuBeds = hospitals.reduce((acc, h) => acc + (h.icu_beds_available || 0), 0);
  const totalGeneralBeds = hospitals.reduce((acc, h) => acc + (h.general_beds_available || 15), 0);
  const pendingCalls = emergencyRequests.filter(r => r.status === 'pending').length;

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery));
    const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* ==================================================================== */}
      {/* 1. MASTER PLATFORM ADMINISTRATOR HEADER & QUICK ACTIONS               */}
      {/* ==================================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0A1B2F] to-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-purple-600/30 border border-purple-500/50 text-purple-300 flex items-center justify-center shadow-lg">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-purple-900/80 text-purple-200 border border-purple-700">
                MASTER ADMIN ACCESS • ROOT LEVEL
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-1 tracking-tight">
              Lifeline Platform Governance & Master Data Hub
            </h2>
            <p className="text-xs text-slate-400">
              Logged in as <strong className="text-purple-300">{currentUser?.name}</strong> • Full system clearance to view all platform data, manage users, fleet, hospitals & telemetry.
            </p>
          </div>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUserModal(true)}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>

          <button
            onClick={handleExportFullJSON}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
            title="Download full database JSON dump"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Master Data</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. TOP METRICS SUMMARY CARDS                                          */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {/* Metric 1: System Users */}
        <div
          onClick={() => setActiveTab('users')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500">System Users</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{users.length}</p>
          <p className="text-[10px] text-purple-700 font-semibold mt-0.5">Add / Remove Users →</p>
        </div>

        {/* Metric 2: Fleet Units */}
        <div
          onClick={() => setActiveTab('fleet')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500">Ambulance Fleet</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Siren className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{ambulances.length}</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">{availableUnits} Available / {busyUnits} Active</p>
        </div>

        {/* Metric 3: Hospitals */}
        <div
          onClick={() => setActiveTab('hospitals')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500">Hospital Centers</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{hospitals.length}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Mira Road Facilities</p>
        </div>

        {/* Metric 4: Total ICU Beds */}
        <div
          onClick={() => setActiveTab('hospitals')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500">ICU Bed Reserve</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">{totalIcuBeds}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">{totalGeneralBeds} Ward Beds Total</p>
        </div>

        {/* Metric 5: CAD Emergency Calls */}
        <div
          onClick={() => setActiveTab('incidents')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500">CAD Incidents</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{emergencyRequests.length}</p>
          <p className="text-[10px] text-amber-700 font-semibold mt-0.5">{pendingCalls} Pending CAD Calls</p>
        </div>
      </div>

      {/* Alert Banner */}
      {alertNote && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center justify-between shadow-xs animate-splash-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{alertNote}</span>
          </div>
          <button onClick={() => setAlertNote(null)} className="font-bold text-emerald-700 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. MAIN NAVIGATION TABS                                              */}
      {/* ==================================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation & Controls Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 text-xs font-semibold overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('all-data')}
              className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all-data' ? 'bg-[#0D253F] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>All System Data</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'users' ? 'bg-[#0D253F] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>User Accounts ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('fleet')}
              className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'fleet' ? 'bg-[#0D253F] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Siren className="w-3.5 h-3.5" />
              <span>Ambulances ({ambulances.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('hospitals')}
              className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'hospitals' ? 'bg-[#0D253F] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Hospitals ({hospitals.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('incidents')}
              className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'incidents' ? 'bg-[#0D253F] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>CAD Incidents ({emergencyRequests.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'audit' ? 'bg-[#0D253F] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Audit Logs</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all records..."
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 w-44 sm:w-56"
              />
            </div>

            {/* Quick action based on tab */}
            {activeTab === 'users' && (
              <button
                onClick={() => setShowUserModal(true)}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add User</span>
              </button>
            )}

            {activeTab === 'fleet' && (
              <button
                onClick={() => setShowAmbulanceModal(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Ambulance</span>
              </button>
            )}

            {activeTab === 'hospitals' && (
              <button
                onClick={() => setShowHospitalModal(true)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Hospital</span>
              </button>
            )}
          </div>
        </div>

        {/* ================================================================== */}
        {/* TAB 1: ALL SYSTEM DATA (Master Unified View for Platform Admin)    */}
        {/* ================================================================== */}
        {activeTab === 'all-data' && (
          <div className="p-6 space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-600" />
                  <span>Consolidated Master Data Repository</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Platform Administrator can view all datasets, inspect records across modules, and download complete reports.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportFullJSON}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-purple-600" />
                  <span>Download JSON Dump</span>
                </button>
                <button
                  onClick={handleExportUsersCSV}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Export Users CSV</span>
                </button>
                <button
                  onClick={handleExportIncidentsCSV}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-amber-600" />
                  <span>Export Incidents CSV</span>
                </button>
              </div>
            </div>

            {/* Sub-grid of Data Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Users Distribution Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>Registered Roles Distribution ({users.length})</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="text-[11px] text-purple-700 font-bold hover:underline cursor-pointer"
                  >
                    Manage Users →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100">
                    <span className="text-[10px] text-purple-700 block font-semibold">Platform Admins</span>
                    <strong className="text-sm font-black text-purple-950">
                      {users.filter(u => u.role === 'Platform Administrator' || u.role === 'Admin').length}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                    <span className="text-[10px] text-blue-700 block font-semibold">Emergency CAD</span>
                    <strong className="text-sm font-black text-blue-950">
                      {users.filter(u => u.role === 'Emergency Coordinator' || u.role === 'Dispatcher').length}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 block font-semibold">Ambulance Crew</span>
                    <strong className="text-sm font-black text-emerald-950">
                      {users.filter(u => u.role === 'Ambulance Operator' || u.role === 'Driver').length}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100">
                    <span className="text-[10px] text-teal-700 block font-semibold">Health Coord</span>
                    <strong className="text-sm font-black text-teal-950">
                      {users.filter(u => u.role === 'Healthcare Coordinator').length}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
                    <span className="text-[10px] text-rose-700 block font-semibold">Citizens / Public</span>
                    <strong className="text-sm font-black text-rose-950">
                      {users.filter(u => u.role === 'Citizen' || u.role === 'Patient').length}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Fleet & Hospital Health Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Siren className="w-4 h-4 text-blue-600" />
                    <span>Fleet & Facility Readiness</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab('fleet')}
                    className="text-[11px] text-blue-700 font-bold hover:underline cursor-pointer"
                  >
                    View Fleet →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-semibold">Total Fleet</span>
                    <strong className="text-sm font-black text-slate-900">{ambulances.length} Units</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 block font-semibold">Units Available</span>
                    <strong className="text-sm font-black text-emerald-900">{availableUnits} Standby</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
                    <span className="text-[10px] text-rose-700 block font-semibold">ICU Beds Free</span>
                    <strong className="text-sm font-black text-rose-900">{totalIcuBeds} Beds</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                    <span className="text-[10px] text-amber-700 block font-semibold">Trauma Hospitals</span>
                    <strong className="text-sm font-black text-amber-900">
                      {hospitals.filter(h => h.has_trauma_center).length} Facilities
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100">
                    <span className="text-[10px] text-purple-700 block font-semibold">Doctors on Duty</span>
                    <strong className="text-sm font-black text-purple-900">
                      {doctors.filter(d => d.onDuty).length} Staffed
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Preview of All Users Table in Master Data View */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="p-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">Master User Directory Snapshot</span>
                <button
                  onClick={() => setShowUserModal(true)}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add New User</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">User</th>
                      <th className="px-4 py-2.5">Role</th>
                      <th className="px-4 py-2.5">Phone</th>
                      <th className="px-4 py-2.5">Role Identifier</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.slice(0, 5).map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-2.5">
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-mono">{u.phone || '—'}</td>
                        <td className="px-4 py-2.5 text-slate-500 font-mono text-[11px]">
                          {u.assignedVehicleNumber || u.operatorCode || u.clearanceLevel || u.bloodType || u.id}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleStartEditUser(u)}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded cursor-pointer"
                              title="Edit user"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setUserToDelete(u)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 2: USERS CRUD MANAGEMENT TABLE                                */}
        {/* ================================================================== */}
        {activeTab === 'users' && (
          <div>
            {/* Role Filter Buttons */}
            <div className="px-4 py-2.5 bg-slate-50/60 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-500 text-[11px] flex items-center gap-1 mr-1">
                  <Filter className="w-3 h-3" /> Filter Role:
                </span>
                {['all', 'Citizen', 'Ambulance Operator', 'Emergency Coordinator', 'Healthcare Coordinator', 'Platform Administrator'].map(role => (
                  <button
                    key={role}
                    onClick={() => setSelectedRoleFilter(role)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                      selectedRoleFilter === role
                        ? 'bg-purple-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {role === 'all' ? 'All Roles' : role}
                  </button>
                ))}
              </div>

              <span className="text-[11px] text-slate-400">
                Showing <strong>{filteredUsers.length}</strong> of {users.length} users
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">User & Contact</th>
                    <th className="px-4 py-3">Access Role</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Role Details</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                            {user.name[0] || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{user.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                            user.role === 'Platform Administrator' || user.role === 'Admin'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : user.role === 'Emergency Coordinator' || user.role === 'Dispatcher'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : user.role === 'Ambulance Operator' || user.role === 'Driver'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : user.role === 'Healthcare Coordinator'
                              ? 'bg-teal-100 text-teal-800 border border-teal-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-medium">{user.phone || '—'}</td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                        {user.assignedVehicleNumber && (
                          <span className="block text-emerald-700 font-bold">Plate: {user.assignedVehicleNumber}</span>
                        )}
                        {user.operatorCode && (
                          <span className="block text-blue-700 font-bold">CAD: {user.operatorCode}</span>
                        )}
                        {user.clearanceLevel && (
                          <span className="block text-purple-700 font-bold">{user.clearanceLevel}</span>
                        )}
                        {user.bloodType && (
                          <span className="block text-rose-700 font-bold">Blood: {user.bloodType}</span>
                        )}
                        {user.affiliatedHospitalName && (
                          <span className="block text-teal-700 truncate max-w-xs">{user.affiliatedHospitalName}</span>
                        )}
                        {!user.assignedVehicleNumber && !user.operatorCode && !user.clearanceLevel && !user.bloodType && !user.affiliatedHospitalName && (
                          <span className="text-slate-400">{user.id}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">{user.createdAt || 'Active'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleStartEditUser(user)}
                            title="Edit user details"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setUserToDelete(user)}
                            title="Remove user account"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 3: AMBULANCES FLEET CRUD                                       */}
        {/* ================================================================== */}
        {activeTab === 'fleet' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Plate & ID</th>
                  <th className="px-4 py-3">Driver & Phone</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Base Landmark</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Fuel</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ambulances
                  .filter(
                    a =>
                      a.vehicle_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      a.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      a.type.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(amb => (
                    <tr key={amb.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono">
                        <strong className="text-slate-900 text-sm block">{amb.vehicle_number}</strong>
                        <span className="text-[10px] text-slate-400">{amb.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">{amb.driver_name}</p>
                        <p className="font-mono text-[11px] text-slate-400">{amb.contact}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{amb.type}</td>
                      <td className="px-4 py-3 text-slate-500 truncate max-w-xs">
                        {amb.current_location.landmark}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            const next = amb.status === 'available' ? 'busy' : 'available';
                            updateAmbulance(amb.id, { status: next });
                            showAlert(`Unit ${amb.vehicle_number} status set to ${next}.`);
                          }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                            amb.status === 'available'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {amb.status} (Toggle)
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {amb.fuel_level || '85%'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Decommission unit ${amb.vehicle_number}?`)) {
                              deleteAmbulance(amb.id);
                              showAlert(`Unit ${amb.vehicle_number} deleted.`);
                            }
                          }}
                          title="Delete ambulance"
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 4: HOSPITALS CRUD                                              */}
        {/* ================================================================== */}
        {activeTab === 'hospitals' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Facility Name</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Hotline</th>
                  <th className="px-4 py-3">ICU Beds Available</th>
                  <th className="px-4 py-3">Trauma Center</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hospitals
                  .filter(
                    h =>
                      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      h.address.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(hosp => (
                    <tr key={hosp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">{hosp.name}</td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{hosp.address}</td>
                      <td className="px-4 py-3 font-mono text-slate-700">{hosp.emergency_contact}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const updated = Math.max(0, (hosp.icu_beds_available || 0) - 1);
                              updateHospital(hosp.id, { icu_beds_available: updated });
                            }}
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 font-bold flex items-center justify-center text-slate-700 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-bold text-slate-900 font-mono w-6 text-center">
                            {hosp.icu_beds_available}
                          </span>
                          <button
                            onClick={() => {
                              const updated = (hosp.icu_beds_available || 0) + 1;
                              updateHospital(hosp.id, { icu_beds_available: updated });
                            }}
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 font-bold flex items-center justify-center text-slate-700 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            hosp.has_trauma_center
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {hosp.has_trauma_center ? 'Level 1 Trauma' : 'General Care'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Remove facility ${hosp.name}?`)) {
                              deleteHospital(hosp.id);
                              showAlert(`Facility ${hosp.name} removed.`);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 5: CAD EMERGENCY INCIDENTS DATASET                            */}
        {/* ================================================================== */}
        {activeTab === 'incidents' && (
          <div className="overflow-x-auto">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">All Registered CAD Emergency Calls ({emergencyRequests.length})</span>
              <button
                onClick={handleExportIncidentsCSV}
                className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-600" />
                <span>Export Incidents CSV</span>
              </button>
            </div>
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Call ID & Caller</th>
                  <th className="px-4 py-3">Emergency Type</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Incident Landmark</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assigned Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {emergencyRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-mono">
                      <strong className="text-slate-900 block">{req.id}</strong>
                      <span className="text-slate-500">{req.callerName} ({req.callerPhone})</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{req.emergencyType}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.priority.includes('Critical')
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {req.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{req.location.landmark}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">
                      {req.assignedAmbulancePlate || 'Standby'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 6: AUDIT & SYSTEM ACTIVITY LOGS                                */}
        {/* ================================================================== */}
        {activeTab === 'audit' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">System Telemetry & Audit Stream</h4>
                <p className="text-xs text-slate-500">Chronological activity logs of dispatches, CRUD modifications, and security authentications</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-mono font-bold">
                AUDIT ENGINE: ACTIVE
              </span>
            </div>

            <div className="space-y-2.5">
              {notifications.map(item => (
                <div key={item.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <p className="text-slate-600 mt-0.5">{item.message}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{item.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* MODAL: ADD USER (Complete Role Support)                              */}
      {/* ==================================================================== */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-splash-in max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Add New User Account</h4>
                  <p className="text-[11px] text-slate-500">Platform Administrator Provisioning Hub</p>
                </div>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Role Selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">User Access Role</label>
                <select
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as UserRole)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none bg-slate-50/50"
                >
                  <option value="Citizen">Citizen (Public Distress & SOS)</option>
                  <option value="Ambulance Operator">Ambulance Operator (Fleet Driver & Paramedic)</option>
                  <option value="Emergency Coordinator">Emergency Coordinator (Control Room CAD Dispatcher)</option>
                  <option value="Healthcare Coordinator">Healthcare Coordinator (Hospital Beds & Doctors)</option>
                  <option value="Platform Administrator">Platform Administrator (System Owner & Super Admin)</option>
                </select>
              </div>

              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    placeholder="e.g. Ramesh Kadam"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    placeholder="e.g. user@lifeline.in"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone Input with 10-digit validation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">10-Digit Mobile Phone</label>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border transition-colors ${
                      newUserPhone.length === 10
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : newUserPhone.length > 0
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {newUserPhone.length === 10 ? '✓ 10 Digits Valid' : `${newUserPhone.length}/10 digits`}
                  </span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                  value={newUserPhone}
                  onChange={e => handlePhoneInputChange(e.target.value, setNewUserPhone, setUserPhoneError)}
                  onKeyDown={handlePhoneKeyDown}
                  placeholder="e.g. 9820012345"
                  className={`w-full border rounded-xl p-2.5 text-xs font-mono tracking-wider focus:outline-none focus:ring-2 ${
                    userPhoneError
                      ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                      : newUserPhone.length === 10
                      ? 'border-emerald-300 focus:ring-emerald-500 bg-emerald-50/10'
                      : 'border-slate-200 focus:ring-purple-500'
                  }`}
                />
                {userPhoneError && (
                  <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {userPhoneError}
                  </p>
                )}
              </div>

              {/* Role-Specific Fields */}
              {newUserRole === 'Citizen' && (
                <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-3">
                  <span className="text-[10px] uppercase font-bold text-rose-700 block">Citizen Medical Profile</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-600 font-bold block mb-1">Blood Group</label>
                      <select
                        value={newBloodType}
                        onChange={e => setNewBloodType(e.target.value)}
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
                        value={newEmergencyContactName}
                        onChange={e => setNewEmergencyContactName(e.target.value)}
                        placeholder="e.g. Spouse / Parent"
                        className="w-full bg-white border border-rose-200 rounded-lg p-2 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {newUserRole === 'Ambulance Operator' && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Fleet Operator Details</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-600 font-bold block mb-1">Assigned Vehicle</label>
                      <input
                        type="text"
                        value={newAssignedVehiclePlate}
                        onChange={e => setNewAssignedVehiclePlate(e.target.value)}
                        placeholder="MH-04-AZ-1024"
                        className="w-full bg-white border border-emerald-200 rounded-lg p-2 text-xs font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 font-bold block mb-1">Driving License</label>
                      <input
                        type="text"
                        value={newLicenseNumber}
                        onChange={e => setNewLicenseNumber(e.target.value)}
                        placeholder="MH-04-2024-XXXX"
                        className="w-full bg-white border border-emerald-200 rounded-lg p-2 text-xs font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}

              {newUserRole === 'Emergency Coordinator' && (
                <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-blue-700 block">CAD Dispatcher Assignment</span>
                  <div>
                    <label className="text-slate-600 font-bold block mb-1">CAD Terminal / Operator Code</label>
                    <input
                      type="text"
                      value={newOperatorCode}
                      onChange={e => setNewOperatorCode(e.target.value)}
                      placeholder="EOC-7708"
                      className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs font-mono uppercase"
                    />
                  </div>
                </div>
              )}

              {newUserRole === 'Healthcare Coordinator' && (
                <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-teal-700 block">Hospital Affiliation</span>
                  <div>
                    <label className="text-slate-600 font-bold block mb-1">Affiliated Hospital Center</label>
                    <select
                      value={newAffiliatedHospital}
                      onChange={e => setNewAffiliatedHospital(e.target.value)}
                      className="w-full bg-white border border-teal-200 rounded-lg p-2 text-xs font-semibold"
                    >
                      {hospitals.map(h => (
                        <option key={h.id} value={h.name}>{h.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {newUserRole === 'Platform Administrator' && (
                <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3">
                  <span className="text-[10px] uppercase font-bold text-purple-700 block">Administrator Clearance Level</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-600 font-bold block mb-1">Clearance Tier</label>
                      <select
                        value={newAdminClearance}
                        onChange={e => setNewAdminClearance(e.target.value as any)}
                        className="w-full bg-white border border-purple-200 rounded-lg p-2 text-xs font-semibold"
                      >
                        <option value="Super Admin">Super Admin</option>
                        <option value="Fleet Manager">Fleet Manager</option>
                        <option value="System Auditor">System Auditor</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-600 font-bold block mb-1">Master Clearance Key</label>
                      <input
                        type="text"
                        value={newAdminSecretKey}
                        onChange={e => setNewAdminSecretKey(e.target.value)}
                        placeholder="EMS-ROOT-2025"
                        className="w-full bg-white border border-purple-200 rounded-lg p-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer shadow-md transition-all active:scale-95"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: DELETE USER CONFIRMATION                                      */}
      {/* ==================================================================== */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-splash-in">
            <div className="p-5 border-b border-rose-100 flex items-center gap-3 bg-rose-50/50">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Confirm User Removal</h4>
                <p className="text-xs text-rose-700">Permanent Database Deletion</p>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-700">
                Are you sure you want to remove the user account for{' '}
                <strong className="text-slate-900 font-bold">{userToDelete.name}</strong>?
              </p>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 font-mono text-[11px]">
                <p><span className="text-slate-400">Role:</span> <strong className="text-slate-800">{userToDelete.role}</strong></p>
                <p><span className="text-slate-400">Email:</span> {userToDelete.email}</p>
                <p><span className="text-slate-400">Phone:</span> {userToDelete.phone || 'N/A'}</p>
              </div>

              {userToDelete.id === currentUser?.id && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Warning: You are currently logged in with this account.</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteUser}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer shadow-md transition-all active:scale-95"
                >
                  Yes, Remove User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: EDIT USER                                                     */}
      {/* ==================================================================== */}
      {showEditUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-splash-in">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h4 className="font-bold text-sm text-slate-900">Edit User Account</h4>
              <button onClick={() => setShowEditUserModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editUserName}
                  onChange={e => setEditUserName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={editUserEmail}
                  onChange={e => setEditUserEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Role Permission</label>
                <select
                  value={editUserRole}
                  onChange={e => setEditUserRole(e.target.value as UserRole)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="Citizen">Citizen (Emergency SOS & Requests)</option>
                  <option value="Ambulance Operator">Ambulance Operator (Driver & Crew)</option>
                  <option value="Emergency Coordinator">Emergency Coordinator (Control Room & Dispatch)</option>
                  <option value="Healthcare Coordinator">Healthcare Coordinator (Hospital, Beds & Doctors)</option>
                  <option value="Platform Administrator">Platform Administrator (System Owner & Audit)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number (10 Digits)</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                  value={editUserPhone}
                  onChange={e => handlePhoneInputChange(e.target.value, setEditUserPhone, setEditPhoneError)}
                  onKeyDown={handlePhoneKeyDown}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                {editPhoneError && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">{editPhoneError}</p>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD AMBULANCE                                                 */}
      {/* ==================================================================== */}
      {showAmbulanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-splash-in">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h4 className="font-bold text-sm text-slate-900">Register New Ambulance Unit</h4>
              <button onClick={() => setShowAmbulanceModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAmbulance} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vehicle Plate</label>
                  <input
                    type="text"
                    required
                    value={newPlate}
                    onChange={e => setNewPlate(e.target.value)}
                    placeholder="MH-04-XX-1234"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Equipment Tier</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Advanced Life Support">Advanced Life Support (ALS)</option>
                    <option value="Basic">Basic Life Support (BLS)</option>
                    <option value="Neonatal / Pediatric ALS">Neonatal / Pediatric ALS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Driver Name</label>
                <input
                  type="text"
                  required
                  value={newDriver}
                  onChange={e => setNewDriver(e.target.value)}
                  placeholder="e.g. Rajesh Shinde"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Driver Contact (10 Digits)</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={newContact}
                  onChange={e => handlePhoneInputChange(e.target.value, setNewContact, setAmbulanceContactError)}
                  onKeyDown={handlePhoneKeyDown}
                  placeholder="e.g. 9820112345"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Base Station / Landmark</label>
                <input
                  type="text"
                  value={newLandmark}
                  onChange={e => setNewLandmark(e.target.value)}
                  placeholder="e.g. Beverly Park Station"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAmbulanceModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Add Ambulance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD HOSPITAL                                                  */}
      {/* ==================================================================== */}
      {showHospitalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-splash-in">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h4 className="font-bold text-sm text-slate-900">Add Partner Medical Facility</h4>
              <button onClick={() => setShowHospitalModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateHospital} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Hospital Name</label>
                <input
                  type="text"
                  required
                  value={newHospName}
                  onChange={e => setNewHospName(e.target.value)}
                  placeholder="e.g. Apex Multispeciality Hospital"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Address / Landmark</label>
                <input
                  type="text"
                  value={newHospAddress}
                  onChange={e => setNewHospAddress(e.target.value)}
                  placeholder="Kanakia Road, Mira Road East, Thane"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Emergency Hotline</label>
                  <input
                    type="text"
                    value={newHospHotline}
                    onChange={e => setNewHospHotline(e.target.value)}
                    placeholder="022-28110000"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ICU Beds</label>
                  <input
                    type="number"
                    min="0"
                    value={newHospBeds}
                    onChange={e => setNewHospBeds(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="traumaCheck"
                  checked={newHospTrauma}
                  onChange={e => setNewHospTrauma(e.target.checked)}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="traumaCheck" className="text-slate-700 font-semibold cursor-pointer">
                  Equipped with Level-1 Trauma Emergency Bay
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowHospitalModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Add Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
