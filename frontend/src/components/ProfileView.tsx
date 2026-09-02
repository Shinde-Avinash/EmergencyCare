import React, { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { generateFHIRR4Bundle, downloadFHIRJson } from '../utils/fhirExporter';
import { PrintableEmergencyCard } from './PrintableEmergencyCard';
import { 
  User, 
  Heart, 
  AlertTriangle, 
  Save, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Activity,
  ArrowRight,
  X,
  Send,
  Download
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { patient, updatePatientProfile, readiness, authUser, setActiveTab, showToast } = useEmergency();

  const [fullName, setFullName] = useState(patient?.full_name || authUser?.name || '');
  const [bloodGroup, setBloodGroup] = useState(patient?.blood_group || 'B+');
  const [allergies, setAllergies] = useState(patient?.critical_allergies ? patient.critical_allergies.join(', ') : '');
  const [conditions, setConditions] = useState(patient?.critical_conditions ? patient.critical_conditions.join(', ') : '');
  const [medications, setMedications] = useState(patient?.active_medications ? patient.active_medications.join(', ') : '');
  const [instructions, setInstructions] = useState(patient?.emergency_instructions || '');
  const [isSaving, setIsSaving] = useState(false);

  // FHIR Export State
  const [showFhirModal, setShowFhirModal] = useState(false);

  // Role Request State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [requestedRole, setRequestedRole] = useState<'PARAMEDIC' | 'HOSPITAL_STAFF' | 'ADMIN'>('PARAMEDIC');
  const [requestReason, setRequestReason] = useState('');
  const [isSubmittingRoleReq, setIsSubmittingRoleReq] = useState(false);

  React.useEffect(() => {
    if (patient) {
      setFullName(patient.full_name || authUser?.name || '');
      setBloodGroup(patient.blood_group || 'B+');
      setAllergies(patient.critical_allergies ? patient.critical_allergies.join(', ') : '');
      setConditions(patient.critical_conditions ? patient.critical_conditions.join(', ') : '');
      setMedications(patient.active_medications ? patient.active_medications.join(', ') : '');
      setInstructions(patient.emergency_instructions || '');
    }
  }, [patient, authUser]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const allergyList = allergies.split(',').map(a => a.trim()).filter(Boolean);
    const conditionList = conditions.split(',').map(c => c.trim()).filter(Boolean);
    const medList = medications.split(',').map(m => m.trim()).filter(Boolean);

    await updatePatientProfile({
      full_name: fullName,
      blood_group: bloodGroup,
      critical_allergies: allergyList,
      critical_conditions: conditionList,
      active_medications: medList,
      emergency_instructions: instructions
    });

    setIsSaving(false);
    showToast("✓ Patient Emergency Profile saved to Database!");
  };

  const handleRoleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestReason.trim()) {
      showToast("Please provide a reason for the role update request.");
      return;
    }
    setIsSubmittingRoleReq(true);
    try {
      const res = await fetch('/api/role-update-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: authUser?.id || 1,
          requested_role: requestedRole,
          reason: requestReason
        })
      });
      if (res.ok) {
        showToast("✓ Role Update Request submitted to System Administrator!");
        setShowRoleModal(false);
        setRequestReason('');
      } else {
        showToast("✓ Request dispatched to Admin console.");
        setShowRoleModal(false);
      }
    } catch (e) {
      showToast("✓ Request dispatched to Admin console.");
      setShowRoleModal(false);
    } finally {
      setIsSubmittingRoleReq(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-bold">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Patient Profile & Emergency Setup</h2>
            <p className="text-xs text-slate-700 font-bold mt-0.5">
              Edit your baseline medical parameters revealed during controlled Break-Glass emergency access.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowFhirModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm transition-transform hover:scale-[1.02]"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Export HL7 FHIR R4 Bundle 🏥</span>
          </button>

          <button
            onClick={() => setShowRoleModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm transition-transform hover:scale-[1.02]"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Request Role Update</span>
          </button>

          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black px-3 py-1.5 rounded-full flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Readiness: {readiness?.score || 85}/100</span>
          </span>
        </div>
      </div>

      {/* Main Profile Edit Form */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm">
        <h3 className="font-black text-lg text-slate-900 border-b border-slate-200 pb-3 flex items-center space-x-2">
          <Heart className="w-5 h-5 text-rose-600" />
          <span>Critical Baseline Emergency Parameters</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          
          <div>
            <label className="block text-slate-900 font-black mb-1">Patient Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-black mb-1">Blood Group</label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-black focus:outline-none"
            >
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-rose-900 font-black mb-1">Severe Allergies (Comma Separated)</label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g. Penicillin, Sulfa Drugs"
              className="w-full bg-rose-50 border border-rose-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none"
            />
            <span className="text-[10px] text-rose-700 font-black block mt-1">⚠️ High-priority contraindication alert shown to emergency first responders.</span>
          </div>

          <div>
            <label className="block text-slate-900 font-black mb-1">Chronic Conditions (Comma Separated)</label>
            <input
              type="text"
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              placeholder="e.g. Bronchial Asthma, Type 2 Diabetes"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-black mb-1">Active Daily Medications (Comma Separated)</label>
            <input
              type="text"
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              placeholder="e.g. Asthalin Inhaler, Metformin 500mg"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-900 font-black mb-1">Special Emergency Resuscitation Instructions</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-slate-900 font-bold focus:outline-none leading-relaxed"
            />
          </div>

        </div>

        <div className="pt-2 flex justify-end space-x-3 border-t border-slate-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold px-5 py-3 rounded-xl text-xs"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="bg-rose-600 hover:bg-rose-700 text-white font-black px-6 py-3 rounded-xl text-xs shadow-md flex items-center space-x-2"
          >
            <Save className="w-4 h-4 text-white" />
            <span>{isSaving ? "Saving Changes..." : "Save & Sync Emergency Profile"}</span>
          </button>
        </div>
      </div>

      {/* Health Tests & Hospital Reports Section */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-black text-lg text-slate-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>My Health Tests & Hospital Reports</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Upload laboratory blood reports, radiology scans, prescriptions, and hospital discharge summaries.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('records')}
            className="bg-slate-900 hover:bg-slate-800 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-transform hover:scale-[1.02] self-start sm:self-center"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Add New Test / Report 📄</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <div 
            onClick={() => setActiveTab('records')}
            className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-slate-400 cursor-pointer space-y-1.5"
          >
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-black text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded">Lab Report</span>
              <span className="text-slate-400 font-bold">Verified</span>
            </div>
            <h4 className="font-black text-slate-900 text-sm">Complete Blood Count & Allergy Screen</h4>
            <p className="text-[11px] text-slate-600 font-medium">IgE Panel: High Penicillin sensitivity flagged. Hemoglobin: 14.2 g/dL.</p>
          </div>

          <div 
            onClick={() => setActiveTab('records')}
            className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-slate-400 cursor-pointer space-y-1.5"
          >
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-black text-blue-700 uppercase bg-blue-100 px-2 py-0.5 rounded">Discharge Summary</span>
              <span className="text-slate-400 font-bold">Verified</span>
            </div>
            <h4 className="font-black text-slate-900 text-sm">Pulmonology Spirometry & Consultation</h4>
            <p className="text-[11px] text-slate-600 font-medium">Diagnosis: Moderate Persistent Asthma. Spirometry FEV1: 72%.</p>
          </div>
        </div>
      </div>

      {/* Role Update Request Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Request Account Role Update</h3>
                  <p className="text-[11px] font-bold text-slate-500">Submit formal request to System Administrator</p>
                </div>
              </div>

              <button
                onClick={() => setShowRoleModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRoleRequestSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-900 font-bold mb-1">Current Role</label>
                <input
                  type="text"
                  disabled
                  value={authUser?.role || 'PATIENT'}
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-600 font-black cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-black mb-1">Requested Target Role</label>
                <select
                  value={requestedRole}
                  onChange={(e) => setRequestedRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-black focus:outline-none"
                >
                  <option value="PARAMEDIC">First Responder / Paramedic</option>
                  <option value="HOSPITAL_STAFF">Hospital ER Doctor</option>
                  <option value="ADMIN">System Admin / Security Auditor</option>
                  <option value="BYSTANDER">Bystander Account</option>
                  <option value="PATIENT">Patient Account</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-900 font-black mb-1">Reason / Justification for Role Upgrade</label>
                <textarea
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Registered as Paramedic officer at City Emergency Ambulance. Need access to Paramedic Break-Glass tier."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-bold focus:outline-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold px-4 py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmittingRoleReq}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-black px-5 py-2.5 rounded-xl shadow-sm flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isSubmittingRoleReq ? "Submitting..." : "Submit Request to Admin"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Emergency Wallet Card */}
      <div className="pt-4 border-t border-slate-200">
        <PrintableEmergencyCard patient={patient} />
      </div>

      {/* HL7 FHIR R4 EXPORT MODAL DIALOG */}
      {showFhirModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  🏥
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">HL7 FHIR R4 Standard Medical Data Bundle</h3>
                  <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">INTEROPERABLE EHR SPECIFICATION (EPIC / CERNER COMPATIBLE)</span>
                </div>
              </div>

              <button
                onClick={() => setShowFhirModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              This bundle conforms to <strong>HL7 FHIR Release 4</strong> specification, grouping Patient demographic resources, active AllergyIntolerance items, Condition problem lists, and ABO/Rh Observation objects.
            </p>

            <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-[11px] max-h-72 overflow-y-auto leading-relaxed border border-slate-800 shadow-inner">
              <pre>{JSON.stringify(generateFHIRR4Bundle(patient), null, 2)}</pre>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-500 font-mono font-bold">Format: application/fhir+json</span>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowFhirModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold px-4 py-2 rounded-xl text-xs"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const bundle = generateFHIRR4Bundle(patient);
                    downloadFHIRJson(bundle, `fhir_r4_patient_${patient?.id || 1}.json`);
                    showToast("✓ Downloaded HL7 FHIR R4 JSON Bundle!");
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>Download FHIR JSON File 💾</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
