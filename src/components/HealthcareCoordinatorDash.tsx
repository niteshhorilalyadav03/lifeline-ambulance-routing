/**
 * ==============================================================================
 * Project: Lifeline - Smart Emergency Ambulance Dispatch & Routing System
 * Component: HealthcareCoordinatorDash.tsx (Hospital, Doctors, Charts, Summaries & Dataset Hub)
 * Role: Healthcare Coordinator
 * ==============================================================================
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  Stethoscope,
  Bed,
  HeartPulse,
  Activity,
  Siren,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PhoneCall,
  UserPlus,
  ShieldCheck,
  FileText,
  Plus,
  Minus,
  Check,
  Flame,
  ArrowRight,
  ShieldAlert,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  Copy,
  Database,
  Filter,
  Search,
  Droplets,
  Wind,
  Layers,
  Sparkles,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

export const HealthcareCoordinatorDash: React.FC = () => {
  const {
    currentUser,
    hospitals,
    ambulances,
    doctors,
    emergencyRequests,
    activeMission,
    toggleDoctorDuty,
    updateHospitalBeds,
    updatePatientHandover,
    updateTreatmentStatus,
    completeMission,
    notify,
    openNewUserModal
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'summaries' | 'dataset'>('overview');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('HOSP-001');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('DOC-01');
  const [assignedBay, setAssignedBay] = useState<string>('Trauma Bay 1');
  const [clinicalNotes, setClinicalNotes] = useState<string>('Patient received via ALS unit. Immediate stabilization initiated.');
  const [showDoctorModal, setShowDoctorModal] = useState<boolean>(false);
  const [datasetSubTab, setDatasetSubTab] = useState<'hospitals' | 'incidents' | 'fleet' | 'doctors'>('hospitals');
  const [datasetSearch, setDatasetSearch] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  // New Doctor state
  const [newDocName, setNewDocName] = useState('');
  const [newDocSpecialty, setNewDocSpecialty] = useState('Emergency Medicine Specialist');
  const [newDocBay, setNewDocBay] = useState('Resuscitation Bay 1');
  const [newDocPhone, setNewDocPhone] = useState('');

  // Currently focused hospital
  const hospital = hospitals.find(h => h.id === selectedHospitalId) || hospitals[0] || {
    id: 'HOSP-001',
    name: 'Bhaktivedanta Hospital & Research Institute',
    address: 'Sector 1, Srishti Complex, Mira Road East',
    emergency_contact: '022-29452500',
    icu_beds_available: 6,
    general_beds_available: 16,
    has_trauma_center: true
  };

  const currentIcuBeds = hospital.icu_beds_available ?? 6;
  const currentGeneralBeds = hospital.general_beds_available ?? 16;
  const onDutyDoctors = doctors.filter(d => d.onDuty);

  const handleSignHandover = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = doctors.find(d => d.id === selectedDoctorId);
    const doctorName = doc ? doc.name : (currentUser?.name || 'Dr. Ananya Roy');
    updatePatientHandover(doctorName, assignedBay, clinicalNotes);
  };

  // ==========================================================================
  // CHART DATASETS
  // ==========================================================================
  // 1. Hospital Bed Comparison Chart Data
  const hospitalBedChartData = hospitals.map(h => ({
    name: h.name.split(' ')[0] + ' ' + (h.name.split(' ')[1] || ''),
    availableICU: h.icu_beds_available || 0,
    availableGeneral: h.general_beds_available || 14,
    totalCapacity: (h.icu_beds_available || 0) + (h.general_beds_available || 14) + 12
  }));

  // 2. Incident Triage Breakdown (Emergency Cases Distribution)
  const triagePieData = [
    { name: 'Cardiac Distress (P1)', value: 34, color: '#EF4444' },
    { name: 'Multi-Trauma Collision (P1)', value: 26, color: '#F97316' },
    { name: 'Acute Respiratory (P2)', value: 20, color: '#3B82F6' },
    { name: 'Stroke / Neuro Triage (P2)', value: 12, color: '#8B5CF6' },
    { name: 'Pediatric / Orthopedic (P3)', value: 8, color: '#10B981' }
  ];

  // 3. Hourly Emergency Admissions & Turnaround Velocity
  const hourlyAdmissionsData = [
    { time: '00:00', arrivals: 2, avgHandoverMins: 4.8 },
    { time: '04:00', arrivals: 1, avgHandoverMins: 3.9 },
    { time: '08:00', arrivals: 6, avgHandoverMins: 4.2 },
    { time: '11:00', arrivals: 9, avgHandoverMins: 4.5 },
    { time: '14:00', arrivals: 7, avgHandoverMins: 4.0 },
    { time: '17:00', arrivals: 12, avgHandoverMins: 5.1 },
    { time: '20:00', arrivals: 10, avgHandoverMins: 4.4 },
    { time: '23:00', arrivals: 4, avgHandoverMins: 4.1 }
  ];

  // 4. Clinical Disposition Outcomes
  const dispositionChartData = [
    { outcome: 'Admitted to ICU', count: 18, color: '#8B5CF6' },
    { outcome: 'Ward Step-Down', count: 24, color: '#0EA5E9' },
    { outcome: 'Emergency Surgery', count: 9, color: '#F43F5E' },
    { outcome: 'Stabilized & Discharged', count: 15, color: '#10B981' },
    { outcome: 'Transferred Specialty', count: 5, color: '#F59E0B' }
  ];

  // 5. Zone Handover Velocity
  const zoneVelocityData = [
    { sector: 'Shanti Park', avgEtaMins: 3.2, goldenHourRate: 97 },
    { sector: 'Kanakia Hub', avgEtaMins: 4.1, goldenHourRate: 95 },
    { sector: 'Station East', avgEtaMins: 3.8, goldenHourRate: 96 },
    { sector: 'Kashimira Hwy', avgEtaMins: 5.4, goldenHourRate: 92 },
    { sector: 'Silver Park', avgEtaMins: 4.6, goldenHourRate: 94 }
  ];

  // Blood Bank Data
  const bloodBankInventory = [
    { group: 'O Positive (O+)', units: 28, status: 'Optimum', demand: 'High' },
    { group: 'O Negative (O-)', units: 6, status: 'Critical / Low', demand: 'Urgent' },
    { group: 'A Positive (A+)', units: 22, status: 'Stable', demand: 'Moderate' },
    { group: 'A Negative (A-)', units: 8, status: 'Moderate', demand: 'Moderate' },
    { group: 'B Positive (B+)', units: 31, status: 'Optimum', demand: 'High' },
    { group: 'B Negative (B-)', units: 5, status: 'Critical / Low', demand: 'Urgent' },
    { group: 'AB Positive (AB+)', units: 14, status: 'Stable', demand: 'Standard' },
    { group: 'AB Negative (AB-)', units: 4, status: 'Critical / Low', demand: 'Urgent' }
  ];

  // ==========================================================================
  // EXPORT HANDLERS FOR DATASETS
  // ==========================================================================
  const handleExportHospitalsCSV = () => {
    const headers = ['Hospital_ID', 'Name', 'Address', 'Emergency_Contact', 'ICU_Beds_Available', 'General_Beds_Available', 'Trauma_Center'];
    const rows = hospitals.map(h => [
      `"${h.id}"`,
      `"${h.name}"`,
      `"${h.address}"`,
      `"${h.emergency_contact}"`,
      h.icu_beds_available || 0,
      h.general_beds_available || 15,
      h.has_trauma_center ? 'Yes' : 'No'
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadBlob(csvContent, 'lifeline-hospitals-capacity-dataset.csv', 'text/csv');
  };

  const handleExportIncidentsCSV = () => {
    const headers = ['Request_ID', 'Caller_Name', 'Caller_Phone', 'Emergency_Type', 'Priority', 'Landmark', 'Sector', 'Status', 'Assigned_Ambulance'];
    const rows = emergencyRequests.map(r => [
      `"${r.id}"`,
      `"${r.callerName}"`,
      `"${r.callerPhone}"`,
      `"${r.emergencyType}"`,
      `"${r.priority}"`,
      `"${r.location.landmark}"`,
      `"${r.location.sector || 'Mira Road'}"`,
      `"${r.status}"`,
      `"${r.assignedAmbulancePlate || 'None'}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadBlob(csvContent, 'lifeline-emergency-incidents-dataset.csv', 'text/csv');
  };

  const handleExportFullJSON = () => {
    const fullClinicalData = {
      exportedAt: new Date().toISOString(),
      facility: hospital.name,
      coordinator: currentUser?.name || 'Healthcare Coordinator',
      metrics: {
        availableIcuBeds: currentIcuBeds,
        availableGeneralBeds: currentGeneralBeds,
        onDutyDoctorsCount: onDutyDoctors.length,
        totalNetworkFacilities: hospitals.length,
        totalAmbulances: ambulances.length,
        totalEmergencyCalls: emergencyRequests.length
      },
      hospitals,
      doctors,
      emergencyRequests,
      ambulances,
      bloodBankInventory,
      hourlyAdmissionsData
    };
    downloadBlob(JSON.stringify(fullClinicalData, null, 2), `lifeline-healthcare-full-dataset-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  };

  const downloadBlob = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type: `${type};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    notify('success', 'DATASET EXPORTED', `File ${filename} downloaded successfully.`);
  };

  const handleCopySummary = () => {
    const text = `LIFELINE HEALTHCARE COORDINATION SUMMARY
Facility: ${hospital.name}
Coordinator: ${currentUser?.name || 'Healthcare Coordinator'}
Time: ${new Date().toLocaleString()}
ICU Beds Available: ${currentIcuBeds} / 12
Emergency Ward Beds: ${currentGeneralBeds} / 25
Doctors On-Duty: ${onDutyDoctors.length}
Total Network Hospitals: ${hospitals.length}
Active CAD Incidents: ${emergencyRequests.filter(r => r.status === 'pending').length} pending
Golden Hour Adherence: 95.8%
Average Handover Velocity: 4.1 mins`;

    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
      notify('status', 'SUMMARY COPIED', 'Clinical handover & capacity summary copied to clipboard.');
    });
  };

  return (
    <div className="space-y-6">
      {/* ==================================================================== */}
      {/* 1. TOP HEALTHCARE COMMAND HEADER                                     */}
      {/* ==================================================================== */}
      <div className="bg-gradient-to-r from-teal-950 via-[#0B2535] to-slate-900 text-white rounded-3xl p-6 border border-teal-800/60 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-teal-600/30 border border-teal-500/50 text-teal-300 flex items-center justify-center shadow-lg">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-teal-900/80 text-teal-200 border border-teal-700">
                HEALTHCARE COORDINATOR COMMAND HUB
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-1 tracking-tight">
              {hospital.name}
            </h2>
            <p className="text-xs text-slate-400">
              Coordinator: <strong className="text-teal-300">{currentUser?.name || 'Dr. Ananya Roy, MD'}</strong> • Emergency Hotline: {hospital.emergency_contact}
            </p>
          </div>
        </div>

        {/* Facility Selector & Quick Export */}
        <div className="flex items-center gap-2.5">
          <select
            value={selectedHospitalId}
            onChange={e => setSelectedHospitalId(e.target.value)}
            className="px-3.5 py-2 bg-slate-800/90 border border-teal-700 text-white rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            {hospitals.map(h => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.icu_beds_available} ICU Beds)
              </option>
            ))}
          </select>

          <button
            onClick={handleCopySummary}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            title="Copy summary"
          >
            <Copy className="w-3.5 h-3.5 text-teal-400" />
            <span>{copyFeedback ? 'Copied!' : 'Copy Brief'}</span>
          </button>

          <button
            onClick={openNewUserModal}
            className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-md"
            title="Enroll new user (Citizen, Operator, Dispatcher, Hospital)"
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-100" />
            <span>+ (New User)</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. NAVIGATION TABS (Overview, Charts, Summaries, Dataset)            */}
      {/* ==================================================================== */}
      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Clinical Handover & Triage</span>
        </button>

        <button
          onClick={() => setActiveTab('charts')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'charts'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics & Visual Charts</span>
        </button>

        <button
          onClick={() => setActiveTab('summaries')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'summaries'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Summaries & Department Readiness</span>
        </button>

        <button
          onClick={() => setActiveTab('dataset')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'dataset'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Complete App Dataset & Exports</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: OVERVIEW & CLINICAL HANDOVER                                  */}
      {/* ==================================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Real-time Inbound Telemetry Alert Banner */}
          {activeMission ? (
            <div className="bg-gradient-to-br from-slate-900 via-[#0B1E36] to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border-2 border-rose-500/80 relative overflow-hidden animate-splash-in">
              <div className="absolute top-0 right-0 w-72 h-72 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
                  </span>
                  <h3 className="font-mono text-sm sm:text-base font-black tracking-wide text-rose-300 uppercase">
                    INCOMING EMERGENCY AMBULANCE TELEMETRY ALERT
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-[11px] font-mono text-slate-300 font-bold">
                    Mission #{activeMission.id}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-700 text-[11px] font-bold">
                    Status: {activeMission.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Grid of Ambulance & Patient Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
                {/* 1. ETA & Vehicle */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Estimated Emergency Arrival
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-yellow-300 font-mono">
                    ~{activeMission.etaMinutes} MINS
                  </div>
                  <div className="text-xs text-slate-300 pt-1 space-y-1">
                    <p>
                      Unit: <strong className="text-white font-mono">{activeMission.ambulanceVehicleNumber}</strong> ({activeMission.ambulanceType})
                    </p>
                    <p>
                      Ambulance Operator: <strong className="text-white">{activeMission.driverName}</strong>
                    </p>
                    <a
                      href={`tel:${activeMission.driverContact}`}
                      className="inline-flex items-center gap-1 text-[11px] text-teal-300 hover:underline font-mono"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>{activeMission.driverContact}</span>
                    </a>
                  </div>
                </div>

                {/* 2. Patient Profile & Emergency */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Patient & Chief Complaint
                  </span>
                  <h4 className="text-base font-bold text-white">
                    {activeMission.patientName}
                  </h4>
                  <p className="text-xs text-rose-300 font-semibold bg-rose-950/50 p-2 rounded-xl border border-rose-800/50">
                    {activeMission.emergencyType}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Pickup: {activeMission.emergencyLocation.landmark || 'Mira Road Hotspot'}
                  </p>
                </div>

                {/* 3. Live Telemetry Vitals */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
                    <span>In-Transit Patient Vitals</span>
                    <span className="text-emerald-400 font-mono text-[9px]">LIVE TELEMETRY</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700">
                      <span className="text-[9px] text-slate-400 block font-mono">BLOOD PRESSURE</span>
                      <span className="font-bold text-white font-mono text-sm">
                        {activeMission.vitals?.bloodPressure || '130/85 mmHg'}
                      </span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700">
                      <span className="text-[9px] text-slate-400 block font-mono">OXYGEN (SpO2)</span>
                      <span className="font-bold text-emerald-400 font-mono text-sm">
                        {activeMission.vitals?.spo2 ? `${activeMission.vitals.spo2}%` : '96%'}
                      </span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700">
                      <span className="text-[9px] text-slate-400 block font-mono">PULSE RATE</span>
                      <span className="font-bold text-yellow-300 font-mono text-sm">
                        {activeMission.vitals?.pulseRate ? `${activeMission.vitals.pulseRate} bpm` : '94 bpm'}
                      </span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700">
                      <span className="text-[9px] text-slate-400 block font-mono">GCS COMA SCORE</span>
                      <span className="font-bold text-white font-mono text-sm">
                        {activeMission.vitals?.gcsScore ? `${activeMission.vitals.gcsScore}/15` : '15/15'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Handover & Treatment Section */}
              <div className="mt-5 pt-5 border-t border-slate-800 bg-slate-900/50 -mx-6 -mb-6 p-6 rounded-b-3xl">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-teal-400" />
                    <span>Patient Handover & Resuscitation Bay Protocol</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold">Treatment Stage:</span>
                    <select
                      value={activeMission.treatmentStatus || 'En Route'}
                      onChange={e => updateTreatmentStatus(e.target.value as any)}
                      className="bg-slate-800 border border-slate-700 text-teal-300 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
                    >
                      <option value="En Route">En Route to Emergency Dept</option>
                      <option value="Triage Arrived">Arrived at Triage</option>
                      <option value="In Treatment">In Active Resuscitation</option>
                      <option value="Admitted ICU">Admitted to Trauma ICU</option>
                      <option value="Stabilized">Patient Stabilized</option>
                      <option value="Discharged">Discharged / Step-Down</option>
                    </select>
                  </div>
                </div>

                {activeMission.handoverCompleted ? (
                  <div className="p-4 rounded-2xl bg-teal-950/70 border border-teal-700 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-800 text-teal-200 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-teal-300" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">
                          Clinical Handover Ratified by {activeMission.handoverSignedBy}
                        </h5>
                        <p className="text-[11px] text-teal-300 mt-0.5">
                          Assigned to: <strong className="text-white">{activeMission.assignedBedNumber}</strong> • Signed at {activeMission.handoverTimestamp}
                        </p>
                        <p className="text-[11px] text-slate-300 italic mt-0.5">
                          "{activeMission.handoverNotes}"
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={completeMission}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-transform active:scale-95"
                    >
                      Complete Mission & Release Ambulance
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSignHandover} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Assign Emergency Doctor
                      </label>
                      <select
                        value={selectedDoctorId}
                        onChange={e => setSelectedDoctorId(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
                      >
                        {doctors.map(doc => (
                          <option key={doc.id} value={doc.id}>
                            {doc.name} ({doc.onDuty ? 'On Duty' : 'Off Duty'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Emergency Bay / Bed
                      </label>
                      <input
                        type="text"
                        value={assignedBay}
                        onChange={e => setAssignedBay(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
                        placeholder="e.g. Trauma Bay 1"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Clinical Triage Notes
                      </label>
                      <input
                        type="text"
                        value={clinicalNotes}
                        onChange={e => setClinicalNotes(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
                        placeholder="Triage assessment..."
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept & Ratify Handover</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>No incoming emergency calls en route at this moment. Trauma Bays on Standby.</span>
            </div>
          )}

          {/* Core Bed & Doctors Controllers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bed Stepper Control */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                    <Bed className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      {hospital.name} Bed Controls
                    </h3>
                    <p className="text-xs text-slate-500">Live capacity adjustments</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  REAL-TIME
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block uppercase">Available ICU Beds</span>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-purple-900 font-mono">{currentIcuBeds}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateHospitalBeds(hospital.id, 0, -1)}
                        disabled={currentIcuBeds <= 0}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-300 font-bold flex items-center justify-center cursor-pointer shadow-2xs disabled:opacity-40"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => updateHospitalBeds(hospital.id, 0, +1)}
                        className="w-7 h-7 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center justify-center cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block uppercase">Emergency Ward Beds</span>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-teal-900 font-mono">{currentGeneralBeds}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateHospitalBeds(hospital.id, -1, 0)}
                        disabled={currentGeneralBeds <= 0}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-300 font-bold flex items-center justify-center cursor-pointer shadow-2xs disabled:opacity-40"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => updateHospitalBeds(hospital.id, +1, 0)}
                        className="w-7 h-7 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center justify-center cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctors Roster */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      Emergency Staff on Duty
                    </h3>
                    <p className="text-xs text-slate-500">{onDutyDoctors.length} Specialists Active</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {doctors.slice(0, 4).map(doc => (
                  <div key={doc.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900">{doc.name}</h4>
                      <p className="text-[11px] text-slate-500">{doc.specialty}</p>
                    </div>
                    <button
                      onClick={() => toggleDoctorDuty(doc.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        doc.onDuty ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {doc.onDuty ? 'On Duty' : 'Off Duty'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: ANALYTICS & VISUAL CHARTS (Recharts)                          */}
      {/* ==================================================================== */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-600" />
                <span>Regional Healthcare Analytics & Clinical Trends</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time visual telemetry on ICU capacities, triage distributions, hourly influx, and emergency turnaround times.
              </p>
            </div>
            <button
              onClick={handleExportFullJSON}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-teal-600" />
              <span>Export Chart Raw Data</span>
            </button>
          </div>

          {/* Grid of Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Hospital Bed Capacity Comparison */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Hospital Bed Capacity by Facility</h4>
                  <p className="text-xs text-slate-500">Available ICU vs General Ward Beds in Mira Road</p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                  NETWORK COMPARISON
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hospitalBedChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="availableICU" name="Available ICU Beds" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="availableGeneral" name="General Ward Beds" fill="#0D9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Emergency Intake by Triage Category */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Emergency Intake by Triage Severity</h4>
                  <p className="text-xs text-slate-500">Distribution of 108 Emergency Incident Categories</p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                  P1 / P2 / P3 RATIO
                </span>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={triagePieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={45}
                      paddingAngle={4}
                      label={({ name, percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {triagePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: 24-Hour Influx & Turnaround Velocity */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">24-Hour Patient Arrivals & Handover Duration</h4>
                  <p className="text-xs text-slate-500">Hourly case volume vs average minutes to triage</p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  HOURLY VELOCITY
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyAdmissionsData}>
                    <defs>
                      <linearGradient id="colorArrivals" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Area type="monotone" dataKey="arrivals" name="Patient Arrivals" stroke="#0284C7" fillOpacity={1} fill="url(#colorArrivals)" />
                    <Line type="monotone" dataKey="avgHandoverMins" name="Avg Handover (mins)" stroke="#EF4444" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Clinical Outcomes Breakdown */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Clinical Patient Disposition Outcomes</h4>
                  <p className="text-xs text-slate-500">Patient pathway post-ED resuscitation</p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                  DISPOSITION
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dispositionChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" stroke="#64748B" fontSize={11} />
                    <YAxis dataKey="outcome" type="category" stroke="#64748B" fontSize={10} width={120} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                    />
                    <Bar dataKey="count" name="Patients" fill="#14B8A6" radius={[0, 4, 4, 0]}>
                      {dispositionChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: SUMMARIES & DEPARTMENT READINESS                              */}
      {/* ==================================================================== */}
      {activeTab === 'summaries' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-500">Golden Hour Adherence</span>
              <p className="text-2xl font-black text-emerald-600 font-mono">95.8%</p>
              <p className="text-[10px] text-slate-400">Target Benchmark: &gt; 90%</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-500">Avg Handover Velocity</span>
              <p className="text-2xl font-black text-blue-600 font-mono">4.1 mins</p>
              <p className="text-[10px] text-slate-400">Ambulance to Trauma Bay</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-500">Active ICU Beds</span>
              <p className="text-2xl font-black text-purple-600 font-mono">
                {hospitals.reduce((acc, h) => acc + (h.icu_beds_available || 0), 0)} Available
              </p>
              <p className="text-[10px] text-slate-400">Across 5 Network Facilities</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-500">Resuscitation Bays</span>
              <p className="text-2xl font-black text-teal-600 font-mono">8 of 10 Ready</p>
              <p className="text-[10px] text-slate-400">2 In Active Procedure</p>
            </div>
          </div>

          {/* Blood Bank & Oxygen Supply Summaries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Blood Bank Reserves */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      Regional Blood Bank Inventory
                    </h3>
                    <p className="text-xs text-slate-500">Emergency units available in Mira Road hubs</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  LIVE STOCK
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {bloodBankInventory.map(item => (
                  <div
                    key={item.group}
                    className={`p-3 rounded-2xl border text-xs space-y-1 ${
                      item.status.includes('Critical')
                        ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <span className="text-[10px] font-bold block text-slate-500">{item.group}</span>
                    <strong className="text-lg font-black font-mono block">{item.units} Units</strong>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded inline-block ${
                        item.status.includes('Critical')
                          ? 'bg-rose-200 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Medical Oxygen & Life Support Infrastructure */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Wind className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      Medical Oxygen & Bulk Supply
                    </h3>
                    <p className="text-xs text-slate-500">Life-support cryogenic tanks & cylinders</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  92% CAPACITY
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span>Liquid Medical Oxygen (LMO) Cryogenic Tank</span>
                    <span className="text-emerald-600 font-mono">18,500 L / 20,000 L</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-teal-600 h-2 rounded-full" style={{ width: '92%' }} />
                  </div>
                  <p className="text-[10px] text-slate-400">Estimated autonomous operational reserve: ~78 Hours</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Type-D Standby Cylinders</span>
                    <strong className="text-base font-black text-slate-900 font-mono">48 Units</strong>
                    <span className="text-[10px] text-emerald-600 font-bold block">100% Pressurized</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Ventilators on Standby</span>
                    <strong className="text-base font-black text-slate-900 font-mono">14 Units</strong>
                    <span className="text-[10px] text-teal-600 font-bold block">Checked & Calibrated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: COMPLETE APP DATASET & EXPORTS                                */}
      {/* ==================================================================== */}
      {activeTab === 'dataset' && (
        <div className="space-y-5">
          {/* Dataset Control Bar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-teal-600" />
                <span>Lifeline Complete System Datasets</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Browse all hospital records, emergency incidents, fleet status, and doctor allocations. Export to CSV or JSON.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExportHospitalsCSV}
                className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-teal-600" />
                <span>Hospitals (CSV)</span>
              </button>

              <button
                onClick={handleExportIncidentsCSV}
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-amber-600" />
                <span>Incidents (CSV)</span>
              </button>

              <button
                onClick={handleExportFullJSON}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Full Dataset (JSON)</span>
              </button>
            </div>
          </div>

          {/* Dataset Selector Tabs & Search */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => setDatasetSubTab('hospitals')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    datasetSubTab === 'hospitals' ? 'bg-[#0D253F] text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Hospitals ({hospitals.length})
                </button>
                <button
                  onClick={() => setDatasetSubTab('incidents')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    datasetSubTab === 'incidents' ? 'bg-[#0D253F] text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Emergency Incidents ({emergencyRequests.length})
                </button>
                <button
                  onClick={() => setDatasetSubTab('fleet')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    datasetSubTab === 'fleet' ? 'bg-[#0D253F] text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Ambulance Fleet ({ambulances.length})
                </button>
                <button
                  onClick={() => setDatasetSubTab('doctors')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    datasetSubTab === 'doctors' ? 'bg-[#0D253F] text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Medical Doctors ({doctors.length})
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={datasetSearch}
                  onChange={e => setDatasetSearch(e.target.value)}
                  placeholder="Filter table rows..."
                  className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 w-52"
                />
              </div>
            </div>

            {/* Sub-Table 1: Hospitals */}
            {datasetSubTab === 'hospitals' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Facility Name</th>
                      <th className="px-4 py-3">Address</th>
                      <th className="px-4 py-3">Emergency Contact</th>
                      <th className="px-4 py-3">ICU Beds</th>
                      <th className="px-4 py-3">Ward Beds</th>
                      <th className="px-4 py-3">Trauma Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {hospitals
                      .filter(h => h.name.toLowerCase().includes(datasetSearch.toLowerCase()) || h.address.toLowerCase().includes(datasetSearch.toLowerCase()))
                      .map(h => (
                        <tr key={h.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-bold text-slate-900">{h.name}</td>
                          <td className="px-4 py-3 text-slate-500">{h.address}</td>
                          <td className="px-4 py-3 font-mono font-medium">{h.emergency_contact}</td>
                          <td className="px-4 py-3 font-mono font-bold text-purple-700">{h.icu_beds_available}</td>
                          <td className="px-4 py-3 font-mono font-bold text-teal-700">{h.general_beds_available || 15}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${h.has_trauma_center ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'}`}>
                              {h.has_trauma_center ? 'Level-1 Trauma' : 'General Care'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sub-Table 2: Emergency Incidents */}
            {datasetSubTab === 'incidents' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">ID & Caller</th>
                      <th className="px-4 py-3">Emergency Complaint</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Landmark</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Assigned Vehicle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {emergencyRequests
                      .filter(r => r.callerName.toLowerCase().includes(datasetSearch.toLowerCase()) || r.emergencyType.toLowerCase().includes(datasetSearch.toLowerCase()))
                      .map(r => (
                        <tr key={r.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-900">{r.callerName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{r.id} • {r.callerPhone}</p>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800">{r.emergencyType}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.priority.includes('Critical') ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                              {r.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">{r.location.landmark}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                              {r.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-teal-700">
                            {r.assignedAmbulancePlate || 'Pending'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sub-Table 3: Fleet */}
            {datasetSubTab === 'fleet' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Plate & ID</th>
                      <th className="px-4 py-3">Driver & Contact</th>
                      <th className="px-4 py-3">Service Tier</th>
                      <th className="px-4 py-3">Base Landmark</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Fuel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ambulances
                      .filter(a => a.vehicle_number.toLowerCase().includes(datasetSearch.toLowerCase()) || a.driver_name.toLowerCase().includes(datasetSearch.toLowerCase()))
                      .map(a => (
                        <tr key={a.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">{a.vehicle_number}</td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800">{a.driver_name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{a.contact}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-700">{a.type}</td>
                          <td className="px-4 py-3 text-slate-500">{a.current_location.landmark}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${a.status === 'available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {a.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600">{a.fuel_level || '85%'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sub-Table 4: Doctors */}
            {datasetSubTab === 'doctors' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Doctor Name</th>
                      <th className="px-4 py-3">Clinical Specialty</th>
                      <th className="px-4 py-3">Assigned Resuscitation Bay</th>
                      <th className="px-4 py-3">Direct Phone</th>
                      <th className="px-4 py-3">Shift Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {doctors
                      .filter(d => d.name.toLowerCase().includes(datasetSearch.toLowerCase()) || d.specialty.toLowerCase().includes(datasetSearch.toLowerCase()))
                      .map(d => (
                        <tr key={d.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-bold text-slate-900">{d.name}</td>
                          <td className="px-4 py-3 text-slate-600">{d.specialty}</td>
                          <td className="px-4 py-3 font-mono text-teal-800">{d.assignedBay || 'General ED'}</td>
                          <td className="px-4 py-3 font-mono text-slate-500">{d.phone}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${d.onDuty ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                              {d.onDuty ? 'On Duty' : 'Off Duty'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
