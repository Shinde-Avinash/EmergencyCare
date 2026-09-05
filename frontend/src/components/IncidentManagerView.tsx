import React from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { IncidentStatus } from '../types';
import { 
  Siren, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Building2, 
  ArrowRight, 
  ShieldAlert, 
  UserCheck, 
  Navigation,
  FileCheck
} from 'lucide-react';

export const IncidentManagerView: React.FC = () => {
  const { activeIncident, updateIncidentStatus, showToast, setActiveTab, patient } = useEmergency();

  // Uplift Feature States: NEWS2 Calculator & PDF Export Modal
  const [showNews2Modal, setShowNews2Modal] = React.useState(false);
  const [respRate, setRespRate] = React.useState(18);
  const [sp02, setSp02] = React.useState(97);
  const [systolicBp, setSystolicBp] = React.useState(115);
  const [pulseRate, setPulseRate] = React.useState(82);
  const [temp, setTemp] = React.useState(37.1);
  const [consciousness, setConsciousness] = React.useState('ALERT');
  const [news2Result, setNews2Result] = React.useState<any>(null);

  const calculateNews2Local = () => {
    let score = 0;
    if (respRate <= 8 || respRate >= 25) score += 3;
    else if (respRate >= 21) score += 2;
    else if (respRate <= 11) score += 1;

    if (sp02 <= 91) score += 3;
    else if (sp02 <= 93) score += 2;
    else if (sp02 <= 95) score += 1;

    if (systolicBp <= 90 || systolicBp >= 220) score += 3;
    else if (systolicBp <= 100) score += 2;
    else if (systolicBp <= 110) score += 1;

    if (pulseRate <= 40 || pulseRate >= 131) score += 3;
    else if (pulseRate >= 111) score += 2;
    else if (pulseRate <= 50 || pulseRate >= 91) score += 1;

    if (consciousness !== 'ALERT') score += 3;
    if (temp <= 35.0) score += 3;
    else if (temp >= 39.1) score += 2;

    const risk = score >= 7 ? 'HIGH' : (score >= 5 ? 'MEDIUM' : 'LOW');
    setNews2Result({
      score,
      risk,
      recommendation: score >= 7 
        ? 'EMERGENCY RESPONSE: Immediate ICU/Trauma specialist transfer!' 
        : (score >= 5 ? 'Urgent clinical review by ER doctor.' : 'Standard ward-level monitoring.')
    });
    showToast(`Calculated NEWS2 Score: ${score} (${risk} Risk)`);
  };

  const handleExportClinicalPDF = () => {
    showToast("📄 Generating Clinical Handoff PDF Summary...");
    setTimeout(() => {
      window.print();
    }, 600);
  };

  const statesOrder: IncidentStatus[] = [
    'CREATED',
    'VERIFIED',
    'RESPONDER_ASSIGNED',
    'HOSPITAL_SELECTED',
    'HOSPITAL_NOTIFIED',
    'PATIENT_IN_TRANSIT',
    'HOSPITAL_RECEIVED',
    'CLOSED'
  ];

  const currentIdx = statesOrder.indexOf(activeIncident?.status || 'CREATED');

  const stateDescriptions: Record<IncidentStatus, string> = {
    CREATED: 'Emergency signal activated by QR scan / Break-Glass portal.',
    VERIFIED: 'Emergency confirmed by first responder on-scene.',
    RESPONDER_ASSIGNED: 'Ambulance Unit #12 dispatched to patient GPS coordinates.',
    HOSPITAL_SELECTED: 'Destination Level-1 Trauma Hospital algorithmically chosen.',
    HOSPITAL_NOTIFIED: 'Emergency Handoff packet transmitted to hospital ER desk.',
    PATIENT_IN_TRANSIT: 'Ambulance en-route to receiving trauma center.',
    HOSPITAL_RECEIVED: 'Patient safely handed off to ER resuscitation room.',
    CLOSED: 'Emergency incident successfully resolved & archived to timeline.'
  };

  const handleAdvanceState = async () => {
    if (currentIdx < statesOrder.length - 1) {
      const next = statesOrder[currentIdx + 1];
      await updateIncidentStatus(next);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Siren className="w-4 h-4 text-rose-400" />
            <span>MODULE 8: EMERGENCY INCIDENT LIFECYCLE STATE MACHINE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Incident Tracker #{activeIncident?.incident_code || 'INC-2026-08-31-004281'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track emergency progression through strict, audited state machine transitions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* NEWS2 Calculator Button */}
          <button
            onClick={() => setShowNews2Modal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md"
          >
            <span>🤖 NEWS2 Triage Score</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={handleExportClinicalPDF}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md"
          >
            <FileCheck className="w-4 h-4" />
            <span>Export Clinical PDF</span>
          </button>

          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400 block font-medium text-[10px]">Current State:</span>
            <span className="font-bold text-amber-400 uppercase tracking-wide">
              {activeIncident?.status.replace(/_/g, ' ')}
            </span>
          </div>

          {currentIdx < statesOrder.length - 1 && (
            <button
              onClick={handleAdvanceState}
              className="bg-gradient-to-r from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-rose-900/40 flex items-center space-x-1.5 transition-all"
            >
              <span>Advance State</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* State Machine Visual Stepper */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <h3 className="font-extrabold text-lg text-white border-b border-slate-800 pb-3 flex items-center justify-between">
          <span>Lifecycle State Machine Stepper</span>
          <span className="text-xs text-slate-400 font-mono">Step {currentIdx + 1} of 8</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statesOrder.map((st, idx) => {
            const isCompleted = idx < currentIdx;
            const isCurrent = idx === currentIdx;

            return (
              <div
                key={st}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-rose-950/40 border-rose-500 text-white ring-2 ring-rose-500/40 shadow-lg shadow-rose-900/30'
                    : (isCompleted 
                        ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                        : 'bg-slate-950/40 border-slate-900 text-slate-600')
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isCurrent ? 'bg-rose-500 text-white' : (isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500')
                  }`}>
                    STEP {idx + 1}
                  </span>
                  {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {isCurrent && <Clock className="w-4 h-4 text-rose-400 animate-spin" />}
                </div>

                <h4 className="font-bold text-xs uppercase tracking-wide mb-1">
                  {st.replace(/_/g, ' ')}
                </h4>

                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  {stateDescriptions[st]}
                </p>

                {isCurrent && (
                  <button
                    onClick={() => {
                      if (st === 'RESPONDER_ASSIGNED' || st === 'HOSPITAL_SELECTED') {
                        setActiveTab('hospitals');
                      } else {
                        handleAdvanceState();
                      }
                    }}
                    className="mt-3 w-full bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center space-x-1"
                  >
                    <span>Execute Action</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Receiving Hospital Info & Location Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Receiving Hospital Info */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-lg text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <span>Assigned Emergency Destination</span>
          </h3>

          {activeIncident?.assigned_hospital ? (
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-base text-white">{activeIncident.assigned_hospital.name}</h4>
                  <p className="text-xs text-slate-400">Emergency Receiving Unit</p>
                </div>
                <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2.5 py-1 rounded-md font-bold border border-cyan-500/40">
                  ETA: {activeIncident.eta_minutes || 7} min
                </span>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <Navigation className="w-4 h-4 text-rose-400" />
                <span>GPS Location: 18.5308° N, 73.8315° E (Senapati Bapat Road)</span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setActiveTab('hospitals')}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1"
                >
                  <span>View Hospital Handoff Console</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 text-center space-y-3">
              <p className="text-xs text-slate-400">No destination hospital assigned to this incident yet.</p>
              <button
                onClick={() => setActiveTab('hospitals')}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Run Hospital Routing Engine
              </button>
            </div>
          )}
        </div>

        {/* Location Timeline */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-lg text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>Incident Location & Event Timeline</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-start space-x-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="font-mono text-amber-400 font-bold w-14">17:02</span>
              <div>
                <span className="font-bold text-white block">Emergency Identity Activated</span>
                <span className="text-slate-400">Location: FC Road Junction (18.5204° N, 73.8567° E)</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="font-mono text-amber-400 font-bold w-14">17:04</span>
              <div>
                <span className="font-bold text-white block">Break-Glass Session Created</span>
                <span className="text-slate-400">Requester: Paramedic Officer R. Patil</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="font-mono text-amber-400 font-bold w-14">17:06</span>
              <div>
                <span className="font-bold text-white block">Hospital Handoff Dispatched</span>
                <span className="text-slate-400">Target: Apex Level-1 Trauma Center</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* NEWS2 Calculator Modal */}
      {showNews2Modal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-6 space-y-5 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🤖</span>
                <h3 className="font-extrabold text-lg text-white">NEWS2 Clinical Triage Score Engine</h3>
              </div>
              <button 
                onClick={() => setShowNews2Modal(false)}
                className="text-slate-400 hover:text-white font-black text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-bold">
              <div>
                <label className="text-slate-400 block mb-1">Respiratory Rate (breaths/min)</label>
                <input
                  type="number"
                  value={respRate}
                  onChange={e => setRespRate(parseInt(e.target.value) || 12)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">SpO2 Oxygen Saturation (%)</label>
                <input
                  type="number"
                  value={sp02}
                  onChange={e => setSp02(parseFloat(e.target.value) || 98)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Systolic Blood Pressure (mmHg)</label>
                <input
                  type="number"
                  value={systolicBp}
                  onChange={e => setSystolicBp(parseInt(e.target.value) || 120)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Pulse Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={pulseRate}
                  onChange={e => setPulseRate(parseInt(e.target.value) || 75)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Consciousness Level</label>
                <select
                  value={consciousness}
                  onChange={e => setConsciousness(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="ALERT">ALERT (Alert & Responsive)</option>
                  <option value="CONFUSED">CONFUSED / VOICE / PAIN / UNRESPONSIVE</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={temp}
                  onChange={e => setTemp(parseFloat(e.target.value) || 37.0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <button
              onClick={calculateNews2Local}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 rounded-xl shadow-md text-xs uppercase tracking-wider"
            >
              Calculate NEWS2 Score & Clinical Protocol
            </button>

            {news2Result && (
              <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                news2Result.risk === 'HIGH' 
                  ? 'bg-rose-950/60 border-rose-600 text-rose-200' 
                  : (news2Result.risk === 'MEDIUM' ? 'bg-amber-950/60 border-amber-600 text-amber-200' : 'bg-emerald-950/60 border-emerald-600 text-emerald-200')
              }`}>
                <div className="flex items-center justify-between font-black text-sm">
                  <span>NEWS2 SCORE: {news2Result.score}</span>
                  <span className="uppercase px-2 py-0.5 rounded bg-black/40">{news2Result.risk} RISK</span>
                </div>
                <p className="font-bold text-[11px] leading-relaxed">{news2Result.recommendation}</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
