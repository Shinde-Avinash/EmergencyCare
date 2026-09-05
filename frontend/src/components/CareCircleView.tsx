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
  Phone,
  ShieldAlert,
  UserPlus
} from 'lucide-react';

export const CareCircleView: React.FC = () => {
  const { showToast, t } = useEmergency();
  
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
    if (!newName.trim() || !newPhone.trim()) {
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
    showToast(`✓ Added ${newM.name} to Family Care Circle!`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* High-Contrast Header */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Users className="w-4 h-4 text-emerald-700" />
            <span>{t('care_circle_header')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{t('care_circle')}</h2>
          <p className="text-xs text-slate-600 font-bold mt-1">
            {t('care_circle_subtitle')}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-black px-3.5 py-1.5 rounded-full flex items-center space-x-1.5 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>{members.length} {t('trusted_contacts')}</span>
          </span>
        </div>
      </div>

      {/* Grid: Care Circle Members List & Consent Governance Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Care Circle Members */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-5 lg:col-span-2 shadow-sm">
          <h3 className="font-black text-lg text-slate-900 border-b border-slate-200 pb-3 flex items-center justify-between">
            <span>{t('care_circle')}</span>
            <span className="text-xs font-black text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              {members.length} Registered
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {members.map((m) => (
              <div key={m.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 shadow-xs hover:border-slate-300 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-slate-900 text-base leading-snug">{m.name}</h4>
                    <span className="text-xs font-black text-slate-600 uppercase tracking-wider block mt-0.5">
                      {m.relationship}
                    </span>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase shadow-2xs ${
                    m.permission_tier === 'FULL' 
                      ? 'bg-emerald-100 text-emerald-950 border-emerald-300' 
                      : 'bg-sky-100 text-sky-950 border-sky-300'
                  }`}>
                    {m.permission_tier === 'FULL' ? t('full_access') : t('emergency_alert_only')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/80">
                  <span className="flex items-center space-x-1.5 text-slate-900 font-bold">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono text-xs font-black text-slate-900">{m.phone}</span>
                  </span>
                  <span className="text-emerald-800 text-[10px] font-black flex items-center space-x-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <Bell className="w-3 h-3 text-emerald-700" />
                    <span>{t('alert_active')}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Member Form */}
          <div className="bg-[#e8f4f0] p-5 rounded-2xl border border-[#c3e2d9] space-y-3.5 shadow-2xs">
            <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <UserPlus className="w-4 h-4 text-emerald-700" />
              <span>{t('add_contact')}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-black text-slate-800 mb-1">{t('caregiver_name')}</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-emerald-600 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-800 mb-1">{t('relationship')}</label>
                <select
                  value={newRel}
                  onChange={(e) => setNewRel(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-emerald-600 cursor-pointer shadow-2xs"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Caregiver">Caregiver</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-800 mb-1">{t('phone_number')}</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91 98230 00000"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-emerald-600 shadow-2xs"
                />
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                onClick={handleAddMember}
                className="bg-slate-900 hover:bg-slate-800 text-white font-black px-5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-transform hover:scale-[1.01]"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>{t('add_contact')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Consent Governance Matrix */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-sm">
          <h3 className="font-black text-lg text-slate-900 border-b border-slate-200 pb-3 flex items-center space-x-2">
            <Lock className="w-5 h-5 text-rose-600" />
            <span>Consent & Data Governance</span>
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="bg-rose-50/80 p-3.5 rounded-2xl border border-rose-200 space-y-1.5 shadow-2xs">
              <div className="flex justify-between items-center font-black text-rose-950">
                <span>WHO: Roadside Bystander</span>
                <span className="bg-rose-200 text-rose-950 font-black px-2 py-0.5 rounded-md text-[10px]">
                  SCOPED TIER
                </span>
              </div>
              <p className="text-slate-800 text-[11px] font-bold leading-relaxed">
                Disclosure restricted strictly to Blood Group, Severe Allergies, & Emergency Caregiver Phone.
              </p>
            </div>

            <div className="bg-sky-50/80 p-3.5 rounded-2xl border border-sky-200 space-y-1.5 shadow-2xs">
              <div className="flex justify-between items-center font-black text-sky-950">
                <span>WHO: First Responder / Paramedic</span>
                <span className="bg-sky-200 text-sky-950 font-black px-2 py-0.5 rounded-md text-[10px]">
                  IMPORTANT TIER
                </span>
              </div>
              <p className="text-slate-800 text-[11px] font-bold leading-relaxed">
                Access includes Active Daily Medications, Bronchial Asthma baseline, & Paramedic emergency instructions.
              </p>
            </div>

            <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 space-y-1.5 shadow-2xs">
              <div className="flex justify-between items-center font-black text-emerald-950">
                <span>WHO: Receiving Hospital ER</span>
                <span className="bg-emerald-200 text-emerald-950 font-black px-2 py-0.5 rounded-md text-[10px]">
                  FULL MEDICAL TIER
                </span>
              </div>
              <p className="text-slate-800 text-[11px] font-bold leading-relaxed">
                Full Emergency Handoff packet, Diagnostic Reports, Spirometry PDF, & Surgery History.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

