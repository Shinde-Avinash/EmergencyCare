import React, { useState, useEffect } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { 
  Scan, 
  ShieldAlert, 
  MapPin, 
  Clock, 
  UserCheck, 
  AlertTriangle, 
  Building2, 
  ArrowRight
} from 'lucide-react';

export const BreakGlassScannerView: React.FC = () => {
  const { currentRole, identity, patient, setActiveTab, showToast, updateIncidentStatus } = useEmergency();
  
  const [isScanning, setIsScanning] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [requesterName, setRequesterName] = useState('Officer R. Patil');
  const [requesterRole, setRequesterRole] = useState<any>(currentRole === 'PATIENT' ? 'PARAMEDIC' : currentRole);
  const [accessReason, setAccessReason] = useState('Roadside Accident — Unconscious Patient');
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins

  useEffect(() => {
    setRequesterRole(currentRole === 'PATIENT' ? 'PARAMEDIC' : currentRole);
  }, [currentRole]);

  useEffect(() => {
    let timer: any;
    if (sessionData && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sessionData, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSimulateScanAndBreakGlass = async () => {
    setIsScanning(true);
    showToast("Scanning QR / NFC Emergency Token...");

    try {
      const res = await fetch('/api/break-glass/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_token: identity?.qr_break_glass_token || 'BG-TOKEN-8942-ALPHA-KEY',
          requester_name: requesterName,
          requester_role: requesterRole,
          access_reason: accessReason,
          latitude: 18.5204,
          longitude: 73.8567,
          device_info: "Paramedic Field Scanner Terminal #09"
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSessionData(data);
        setIsScanning(false);
        showToast("🚨 BREAK-GLASS EMERGENCY ACCESS AUTHORIZED!");
      } else {
        throw new Error("Failed initiating session");
      }
    } catch (e) {
      setSessionData({
        session_token: "BGS-9021-LOCAL-DEMO",
        patient_emergency_id: "EMG-8942-X",
        patient_name: "Rahul Sharma",
        blood_group: "B+",
        critical_allergies: ["Penicillin", "Sulfa Drugs"],
        critical_conditions: ["Bronchial Asthma", "Type 2 Diabetes"],
        active_medications: ["Asthalin Inhaler (100mcg)", "Metformin 500mg"],
        emergency_instructions: "Severe Penicillin allergy! Do not administer beta-lactam antibiotics. Keep airways clear.",
        emergency_contacts: [
          { name: "Priya Sharma", relation: "Spouse", phone: "+91 98230 99887" }
        ],
        ai_emergency_summary: "Patient has recorded Penicillin allergy and history of bronchial asthma. Current medication includes Asthalin Inhaler and Metformin.",
        scoped_tier: requesterRole === 'BYSTANDER' ? 'CRITICAL' : (requesterRole === 'PARAMEDIC' ? 'IMPORTANT' : 'FULL'),
        expires_at: "15:00 UTC"
      });
      setIsScanning(false);
      showToast("🚨 BREAK-GLASS EMERGENCY ACCESS AUTHORIZED!");
    }
  };

  const handleStartEmergencyDispatch = async () => {
    await updateIncidentStatus('RESPONDER_ASSIGNED');
    showToast("Incident State Updated -> RESPONDER_ASSIGNED. Navigating to Hospital Dispatch...");
    setActiveTab('hospitals');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-rose-700 font-black text-xs uppercase tracking-wider mb-1">
            <Scan className="w-4 h-4 text-rose-600" />
            <span>MODULE 2: BREAK-GLASS EMERGENCY ACCESS PORTAL</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Controlled Emergency Scanner</h2>
          <p className="text-xs text-slate-700 font-bold mt-0.5">
            Initiate controlled, time-limited break-glass access sessions with role-scoped data disclosure.
          </p>
        </div>

        {sessionData && (
          <div className="flex items-center space-x-3 bg-amber-100 border border-amber-300 px-4 py-2 rounded-xl">
            <Clock className="w-5 h-5 text-amber-800 animate-pulse" />
            <div>
              <span className="text-[10px] text-amber-900 uppercase font-black block">SESSION EXPIRES IN</span>
              <span className="text-lg font-mono font-black text-amber-950">{formatTime(timeLeft)}</span>
            </div>
          </div>
        )}
      </div>

      {!sessionData ? (
        /* Form & Scanner launch screen */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-5 shadow-sm">
            <h3 className="font-black text-lg text-slate-900 flex items-center space-x-2 border-b border-slate-200 pb-3">
              <UserCheck className="w-5 h-5 text-rose-600" />
              <span>Responder Authorization Form</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-900 font-black mb-1">Requester Full Name</label>
                <input
                  type="text"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:outline-none"
                  placeholder="e.g. Officer R. Patil"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-black mb-1">Requester Role Tier</label>
                <select
                  value={requesterRole}
                  onChange={(e) => setRequesterRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-black focus:outline-none"
                >
                  <option value="BYSTANDER">Bystander (Critical Allergies & Blood Group only)</option>
                  <option value="PARAMEDIC">First Responder / Paramedic (Critical + Medications)</option>
                  <option value="HOSPITAL_STAFF">Hospital ER Doctor (Full History & Reports)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-900 font-black mb-1">Access Reason / Emergency Description</label>
                <textarea
                  value={accessReason}
                  onChange={(e) => setAccessReason(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-bold focus:outline-none"
                  placeholder="e.g. Unconscious patient found at FC Road junction."
                />
              </div>

              <div className="bg-slate-100 p-3 rounded-xl border border-slate-300 flex items-center justify-between text-slate-800 text-xs">
                <span className="flex items-center space-x-1.5 font-black">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  <span>GPS Location Capture:</span>
                </span>
                <span className="font-mono text-slate-950 font-black">18.5204° N, 73.8567° E (Pune)</span>
              </div>
            </div>

            <button
              onClick={handleSimulateScanAndBreakGlass}
              disabled={isScanning}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-3.5 rounded-xl shadow-md text-sm flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
            >
              <Scan className="w-5 h-5 text-white" />
              <span>{isScanning ? "Scanning & Authorizing Token..." : "Simulate QR Scan & Break-Glass"}</span>
            </button>
          </div>

          {/* Scanner Visualizer Box */}
          <div className="bg-white border border-slate-200 p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-6 shadow-sm">
            <div className="w-48 h-48 border-4 border-dashed border-rose-400 rounded-3xl flex items-center justify-center relative bg-rose-50 shadow-inner">
              <Scan className={`w-16 h-16 text-rose-600 ${isScanning ? 'animate-bounce' : 'animate-pulse'}`} />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-black text-slate-900">QR / NFC Scanner Terminal</h4>
              <p className="text-xs text-slate-700 font-bold max-w-xs mx-auto">
                Point camera at patient's Emergency QR Card or hold phone against NFC bracelet.
              </p>
            </div>
          </div>

        </div>
      ) : (
        /* Authorized Emergency Snapshot Display */
        <div className="space-y-6 animate-fadeIn">
          
          {/* Active Session Banner */}
          <div className="bg-rose-100 border-2 border-rose-400 p-6 rounded-2xl space-y-3 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-rose-600 text-white rounded-xl">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-black text-rose-950 uppercase">SESSION TOKEN:</span>
                    <span className="text-xs font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-rose-300 shadow-sm">{sessionData.session_token}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{sessionData.patient_name} (Blood Group: {sessionData.blood_group})</h3>
                </div>
              </div>

              <span className="text-xs font-black text-amber-950 bg-amber-200 px-3 py-1.5 rounded-full border border-amber-400 self-start sm:self-center">
                Data Scope: {sessionData.scoped_tier}
              </span>
            </div>
          </div>

          {/* Scoped Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Critical Allergies & Conditions */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 lg:col-span-2 shadow-sm">
              <h3 className="font-black text-lg text-slate-900 border-b border-slate-200 pb-3 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Authorized Patient Snapshot</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-rose-100 border border-rose-300 p-4 rounded-xl space-y-2">
                  <span className="text-xs font-black text-rose-950 uppercase tracking-wide block">Severe Allergies</span>
                  <div className="flex flex-wrap gap-1.5">
                    {sessionData.critical_allergies.map((a: string) => (
                      <span key={a} className="bg-rose-600 text-white text-xs px-2.5 py-1 rounded-md font-black shadow-sm">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-100 border border-slate-300 p-4 rounded-xl space-y-2">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wide block">Critical Conditions</span>
                  <div className="flex flex-wrap gap-1.5">
                    {sessionData.critical_conditions.map((c: string) => (
                      <span key={c} className="bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md font-black">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Medications */}
              {sessionData.scoped_tier !== 'CRITICAL' && (
                <div className="bg-slate-100 border border-slate-300 p-4 rounded-xl space-y-2">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wide block">Active Medications List</span>
                  <div className="flex flex-wrap gap-1.5">
                    {sessionData.active_medications.map((m: string) => (
                      <span key={m} className="bg-slate-800 text-white text-xs px-2.5 py-1 rounded-md font-black">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Emergency Instructions Box */}
              <div className="bg-slate-900 text-white p-4 rounded-xl space-y-1">
                <span className="text-xs font-black text-rose-400 block uppercase">🚨 EMERGENCY INSTRUCTIONS FOR RESPONDERS:</span>
                <p className="text-xs text-slate-100 font-bold leading-relaxed">
                  "{sessionData.emergency_instructions}"
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleStartEmergencyDispatch}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-3.5 rounded-xl shadow-md text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
                >
                  <Building2 className="w-5 h-5 text-white" />
                  <span>Proceed to Hospital Dispatch & Emergency Handoff</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Emergency Contacts Panel */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <h3 className="font-black text-lg text-slate-900 border-b border-slate-200 pb-3">
                Emergency Care Contacts
              </h3>

              <div className="space-y-3">
                {sessionData.emergency_contacts.map((c: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h5 className="font-black text-slate-900 text-xs">{c.name}</h5>
                      <span className="text-[11px] text-slate-700 font-bold">{c.relation}</span>
                    </div>
                    <a
                      href={`tel:${c.phone}`}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-black shadow-sm"
                    >
                      Call {c.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
