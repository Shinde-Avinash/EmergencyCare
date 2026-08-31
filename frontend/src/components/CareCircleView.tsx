import React, { useState, useEffect } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { CareCircleMember } from '../types';
import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  Bell, 
  CheckCircle2, 
  Lock, 
  Plus, 
  Heart,
  Phone
} from 'lucide-react';

export const CareCircleView: React.FC = () => {
  const { showToast } = useEmergency();
  
  const [members, setMembers] = useState<CareCircleMember[]>([]);
  const [newName, setNewName] = useState('');
  const [newRel, setNewRel] = useState('Parent');
  const [newPhone, setNewPhone] = useState('');

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/care-circle/1');
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (e) {
      setMembers([
        { id: 1, name: "Priya Sharma", relationship: "Spouse", phone: "+91 98230 99887", permission_tier: "FULL", notify_on_break_glass: true },
        { id: 2, name: "Amit Sharma", relationship: "Brother", phone: "+91 98230 44332", permission_tier: "EMERGENCY_NOTIFY", notify_on_break_glass: true }
      ]);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAddMember = () => {
    if (!newName || !newPhone) {
      showToast("Please provide member name and phone number");
      return;
    }
    const newM: CareCircleMember = {
      id: Date.now(),
      name: newName,
      relationship: newRel,
      phone: newPhone,
      permission_tier: "EMERGENCY_NOTIFY",
      notify_on_break_glass: true
    };
    setMembers([...members, newM]);
    setNewName('');
    setNewPhone('');
    showToast(`Added ${newM.name} to Family Care Circle!`);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>MODULE 16 & 17: FAMILY CARE CIRCLE & CONSENT GOVERNANCE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Family Care Circle</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage trusted caregivers, assign granular consent permissions, and automate emergency alerts.
          </p>
        </div>
      </div>

      {/* Grid: Care Circle Members List & Consent Governance Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Care Circle Members */}
        <div className="glass-panel p-6 rounded-2xl space-y-5 lg:col-span-2 shadow-xl">
          <h3 className="font-extrabold text-lg text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Trusted Care Circle Members</span>
            <span className="text-xs font-mono text-slate-400">{members.length} Members Registered</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {members.map((m) => (
              <div key={m.id} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm">{m.name}</h4>
                    <span className="text-[10px] text-slate-400">{m.relationship}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                    m.permission_tier === 'FULL' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {m.permission_tier}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                  <span className="flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{m.phone}</span>
                  </span>
                  <span className="text-emerald-400 text-[10px] font-bold flex items-center space-x-1">
                    <Bell className="w-3 h-3" />
                    <span>Alert Active</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Member Form */}
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-3 pt-4">
            <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">Add New Care Circle Contact</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Full Name"
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-medium focus:outline-none"
              />
              <select
                value={newRel}
                onChange={(e) => setNewRel(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold focus:outline-none"
              >
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Child">Child</option>
                <option value="Caregiver">Caregiver</option>
              </select>
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Phone Number (+91...)"
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-medium focus:outline-none"
              />
            </div>
            <button
              onClick={handleAddMember}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Caregiver</span>
            </button>
          </div>
        </div>

        {/* Consent Governance Matrix */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-lg text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
            <Lock className="w-5 h-5 text-rose-400" />
            <span>Consent & Data Governance</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between font-bold text-rose-400">
                <span>WHO: Emergency Bystander</span>
                <span className="text-emerald-400">ALLOWED</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Access restricted to Blood Group, Severe Allergies, & Emergency Contact.
              </p>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between font-bold text-emerald-400">
                <span>WHO: First Responder / Paramedic</span>
                <span className="text-emerald-400">ALLOWED</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Access includes Active Daily Medications & Bronchial Asthma history.
              </p>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between font-bold text-cyan-400">
                <span>WHO: Receiving Hospital ER</span>
                <span className="text-emerald-400">ALLOWED</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Full Emergency Handoff packet, Diagnostic Reports, & Spirometry history.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
