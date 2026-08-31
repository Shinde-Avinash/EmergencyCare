import React, { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { 
  User, 
  Heart, 
  AlertTriangle, 
  Save, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Activity,
  ArrowRight
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { patient, updatePatientProfile, readiness, setActiveTab, showToast } = useEmergency();

  const [fullName, setFullName] = useState(patient?.full_name || 'Rahul Sharma');
  const [bloodGroup, setBloodGroup] = useState(patient?.blood_group || 'B+');
  const [allergies, setAllergies] = useState(patient?.critical_allergies.join(', ') || 'Penicillin, Sulfa Drugs');
  const [conditions, setConditions] = useState(patient?.critical_conditions.join(', ') || 'Bronchial Asthma, Type 2 Diabetes');
  const [medications, setMedications] = useState(patient?.active_medications.join(', ') || 'Asthalin Inhaler (100mcg), Metformin (500mg)');
  const [instructions, setInstructions] = useState(patient?.emergency_instructions || 'Severe Penicillin allergy! Do not administer beta-lactam antibiotics. Keep airways clear.');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const allergyList = allergies.split(',').map(a => a.strip ? a.strip() : a.trim()).filter(Boolean);
    const conditionList = conditions.split(',').map(c => c.strip ? c.strip() : c.trim()).filter(Boolean);
    const medList = medications.split(',').map(m => m.strip ? m.strip() : m.trim()).filter(Boolean);

    await updatePatientProfile({
      full_name: fullName,
      blood_group: bloodGroup,
      critical_allergies: allergyList,
      critical_conditions: conditionList,
      active_medications: medList,
      emergency_instructions: instructions
    });

    setIsSaving(false);
    showToast("✓ Patient Emergency Profile & QR Identity updated successfully!");
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

        <div className="flex items-center space-x-2">
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

    </div>
  );
};
