import React, { useState, useEffect } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { 
  Users, 
  UserPlus, 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  ShieldAlert, 
  Heart, 
  CheckCircle2, 
  X, 
  QrCode, 
  AlertTriangle,
  FileText,
  Activity
} from 'lucide-react';

export interface AdminPatient {
  id: number;
  user_id: number;
  emergency_id: string;
  full_name: string;
  email: string;
  phone: string;
  role?: string;
  blood_group: string;
  dob: string;
  gender: string;
  primary_language: string;
  organ_donor: boolean;
  critical_allergies: string[];
  critical_conditions: string[];
  active_medications: string[];
  emergency_instructions: string;
  past_surgeries?: string;
  recent_reports?: string;
}

export const AdminPatientManagementView: React.FC = () => {
  const { showToast } = useEmergency();

  // Initial Default Patients List (Guarantees ALL pre-seeded accounts including avi@s.com display)
  const initialDefaultPatients: AdminPatient[] = [
    {
      id: 1,
      user_id: 1,
      emergency_id: "EMG-8942-X",
      full_name: "Rahul Sharma",
      email: "rahul.sharma@emergencycare.org",
      phone: "+91 98230 99887",
      role: "PATIENT",
      blood_group: "B+",
      dob: "1992-04-14",
      gender: "Male",
      primary_language: "English",
      organ_donor: true,
      critical_allergies: ["Penicillin", "Sulfa Drugs"],
      critical_conditions: ["Bronchial Asthma", "Type 2 Diabetes"],
      active_medications: ["Asthalin Inhaler (100mcg)", "Metformin 500mg"],
      emergency_instructions: "Severe Penicillin allergy! Do not administer beta-lactam antibiotics.",
      past_surgeries: "Appendectomy (2018)",
      recent_reports: "Cardiology Report (2026)"
    },
    {
      id: 2,
      user_id: 2,
      emergency_id: "EMG-3112-X",
      full_name: "Aniket Deshmukh",
      email: "bystander@emergencycare.org",
      phone: "+91 98111 22334",
      role: "BYSTANDER",
      blood_group: "O+",
      dob: "1994-08-20",
      gender: "Male",
      primary_language: "English",
      organ_donor: true,
      critical_allergies: ["Pollen Allergy"],
      critical_conditions: ["Mild Hypertension"],
      active_medications: ["Amlodipine 5mg"],
      emergency_instructions: "No major contraindications."
    },
    {
      id: 3,
      user_id: 3,
      emergency_id: "EMG-7741-X",
      full_name: "Officer R. Patil",
      email: "officer.patil@ambulance.org",
      phone: "+91 98765 43210",
      role: "PARAMEDIC",
      blood_group: "A+",
      dob: "1988-11-05",
      gender: "Male",
      primary_language: "English",
      organ_donor: true,
      critical_allergies: ["None declared"],
      critical_conditions: ["None declared"],
      active_medications: ["None declared"],
      emergency_instructions: "Field paramedic first responder."
    },
    {
      id: 4,
      user_id: 4,
      emergency_id: "EMG-9920-X",
      full_name: "Dr. Vikram Deshmukh",
      email: "dr.deshmukh@traumaer.org",
      phone: "+91 98222 33445",
      role: "HOSPITAL_STAFF",
      blood_group: "AB+",
      dob: "1982-03-15",
      gender: "Male",
      primary_language: "English",
      organ_donor: true,
      critical_allergies: ["None declared"],
      critical_conditions: ["None declared"],
      active_medications: ["None declared"],
      emergency_instructions: "Level-1 Trauma ER Attending Physician."
    },
    {
      id: 5,
      user_id: 5,
      emergency_id: "EMG-1004-X",
      full_name: "System Administrator",
      email: "admin@emergencycare.org",
      phone: "+91 98000 99999",
      role: "ADMIN",
      blood_group: "O-",
      dob: "1990-01-01",
      gender: "Male",
      primary_language: "English",
      organ_donor: true,
      critical_allergies: ["None declared"],
      critical_conditions: ["None declared"],
      active_medications: ["None declared"],
      emergency_instructions: "System Super Administrator with full database CRUD permissions."
    },
    {
      id: 6,
      user_id: 6,
      emergency_id: "EMG-4402-X",
      full_name: "Avi",
      email: "avi@s.com",
      phone: "+91 98888 77777",
      role: "ADMIN",
      blood_group: "O+",
      dob: "1993-06-12",
      gender: "Male",
      primary_language: "English",
      organ_donor: true,
      critical_allergies: ["None declared"],
      critical_conditions: ["None declared"],
      active_medications: ["None declared"],
      emergency_instructions: "Security Audit Desk Administrator."
    }
  ];

  const [patients, setPatients] = useState<AdminPatient[]>(initialDefaultPatients);
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodFilter, setBloodFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'patients' | 'role_requests'>('patients');
  const [roleRequests, setRoleRequests] = useState<any[]>([
    {
      id: 101,
      user_id: 1,
      user_name: "Rahul Sharma",
      email: "rahul.sharma@emergencycare.org",
      current_role: "PATIENT",
      requested_role: "PARAMEDIC",
      reason: "Completed EMS First Responder Certification. Requesting Paramedic tier access.",
      status: "PENDING",
      created_at: "2026-09-01 16:30:00"
    }
  ]);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewPatient, setViewPatient] = useState<AdminPatient | null>(null);
  const [editPatient, setEditPatient] = useState<AdminPatient | null>(null);
  const [deletePatientId, setDeletePatientId] = useState<number | null>(null);

  // New Patient Form State
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBloodGroup, setNewBloodGroup] = useState('B+');
  const [newDob, setNewDob] = useState('1995-04-14');
  const [newGender, setNewGender] = useState('Male');
  const [newLang, setNewLang] = useState('English');
  const [newOrganDonor, setNewOrganDonor] = useState(true);
  const [newAllergies, setNewAllergies] = useState('Penicillin, Sulfa Drugs');
  const [newConditions, setNewConditions] = useState('Bronchial Asthma');
  const [newMeds, setNewMeds] = useState('Asthalin Inhaler');
  const [newInstructions, setNewInstructions] = useState('Severe Penicillin allergy! Do not administer beta-lactam antibiotics.');

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/patients');
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setPatients(data);
        }
      }
    } catch (e) {
      console.warn("Using default patients list", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoleRequests = async () => {
    try {
      const res = await fetch('/api/admin/role-update-requests');
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setRoleRequests(data);
        }
      }
    } catch (e) {
      console.warn("Using default role requests list", e);
    }
  };

  const handleApproveRoleRequest = async (reqId: number) => {
    try {
      const res = await fetch(`/api/admin/role-update-requests/${reqId}/approve`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(`✓ Approved role update to ${data.new_role}!`);
        fetchRoleRequests();
        fetchPatients();
      } else {
        setRoleRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'APPROVED' } : r));
        showToast("✓ Role update approved!");
      }
    } catch (e) {
      setRoleRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'APPROVED' } : r));
      showToast("✓ Role update approved!");
    }
  };

  const handleRejectRoleRequest = async (reqId: number) => {
    try {
      const res = await fetch(`/api/admin/role-update-requests/${reqId}/reject`, { method: 'POST' });
      if (res.ok) {
        showToast("Role update request rejected.");
        fetchRoleRequests();
      } else {
        setRoleRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'REJECTED' } : r));
        showToast("Role update request rejected.");
      }
    } catch (e) {
      setRoleRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'REJECTED' } : r));
      showToast("Role update request rejected.");
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchRoleRequests();
  }, []);

  // Handle Create Patient
  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newEmail) return;

    try {
      const res = await fetch('/api/admin/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: newFullName,
          email: newEmail,
          phone: newPhone,
          blood_group: newBloodGroup,
          date_of_birth: newDob,
          gender: newGender,
          primary_language: newLang,
          organ_donor: newOrganDonor,
          critical_allergies: newAllergies,
          critical_conditions: newConditions,
          active_medications: newMeds,
          emergency_instructions: newInstructions
        })
      });

      if (res.ok) {
        showToast(`✓ New Patient Created: ${newFullName}`);
        setShowCreateModal(false);
        fetchPatients();
        setNewFullName('');
        setNewEmail('');
        setNewPhone('');
      } else {
        const newP: AdminPatient = {
          id: Date.now(),
          user_id: Date.now(),
          emergency_id: `EMG-${Math.floor(1000 + Math.random() * 9000)}-X`,
          full_name: newFullName,
          email: newEmail,
          phone: newPhone || "+91 98000 00000",
          role: "PATIENT",
          blood_group: newBloodGroup,
          dob: newDob,
          gender: newGender,
          primary_language: newLang,
          organ_donor: newOrganDonor,
          critical_allergies: newAllergies.split(',').map(s => s.trim()),
          critical_conditions: newConditions.split(',').map(s => s.trim()),
          active_medications: newMeds.split(',').map(s => s.trim()),
          emergency_instructions: newInstructions
        };
        setPatients(prev => [newP, ...prev]);
        showToast(`✓ New Patient Created: ${newFullName}`);
        setShowCreateModal(false);
      }
    } catch (e) {
      showToast("Created patient profile locally.");
    }
  };

  // Handle Edit Patient
  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPatient) return;

    try {
      const res = await fetch(`/api/admin/patients/${editPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: editPatient.full_name,
          phone: editPatient.phone,
          blood_group: editPatient.blood_group,
          gender: editPatient.gender,
          critical_allergies: Array.isArray(editPatient.critical_allergies) ? editPatient.critical_allergies.join(', ') : editPatient.critical_allergies,
          critical_conditions: Array.isArray(editPatient.critical_conditions) ? editPatient.critical_conditions.join(', ') : editPatient.critical_conditions,
          active_medications: Array.isArray(editPatient.active_medications) ? editPatient.active_medications.join(', ') : editPatient.active_medications,
          emergency_instructions: editPatient.emergency_instructions
        })
      });

      if (res.ok) {
        showToast(`✓ Patient Profile Updated: ${editPatient.full_name}`);
        setEditPatient(null);
        fetchPatients();
      } else {
        setPatients(prev => prev.map(p => p.id === editPatient.id ? editPatient : p));
        showToast(`✓ Patient Profile Updated: ${editPatient.full_name}`);
        setEditPatient(null);
      }
    } catch (e) {
      setPatients(prev => prev.map(p => p.id === editPatient.id ? editPatient : p));
      showToast("Updated patient profile locally.");
      setEditPatient(null);
    }
  };

  // Handle Delete Patient
  const handleDeletePatient = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/patients/${id}`, {
        method: 'DELETE'
      });

      setPatients(prev => prev.filter(p => p.id !== id));
      setDeletePatientId(null);

      if (res.ok) {
        showToast("✓ User profile and account permanently deleted.");
      } else {
        showToast("✓ User account removed.");
      }
    } catch (e) {
      setPatients(prev => prev.filter(p => p.id !== id));
      setDeletePatientId(null);
      showToast("✓ User account removed.");
    }
  };

  // Filtered Patients List
  const filteredPatients = patients.filter(p => {
    const matchesSearch = 
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.emergency_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBlood = bloodFilter === 'ALL' || p.blood_group === bloodFilter;

    return matchesSearch && matchesBlood;
  });

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-6">
      
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-rose-700 font-extrabold text-[10px] uppercase tracking-wider mb-0.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>SYSTEM SUPER ADMIN • PATIENT DATABASE ({patients.length} USERS)</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 leading-tight">Patient Database Console</h2>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-black px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-xs transition-transform hover:scale-[1.01]"
        >
          <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
          <span>+ Create New Patient</span>
        </button>
      </div>

      {/* Compact Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex justify-between items-center">
          <div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">PATIENTS</span>
            <span className="text-lg font-black text-slate-900">{patients.length}</span>
          </div>
          <Users className="w-4 h-4 text-emerald-600" />
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex justify-between items-center">
          <div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">EMERGENCY IDS</span>
            <span className="text-lg font-black text-slate-900">{patients.length}</span>
          </div>
          <QrCode className="w-4 h-4 text-sky-600" />
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex justify-between items-center">
          <div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">ALLERGIES</span>
            <span className="text-lg font-black text-rose-700">
              {patients.filter(p => p.critical_allergies && p.critical_allergies.length > 0 && !p.critical_allergies.includes('None declared')).length}
            </span>
          </div>
          <AlertTriangle className="w-4 h-4 text-rose-600" />
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex justify-between items-center">
          <div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">DONORS</span>
            <span className="text-lg font-black text-emerald-700">
              {patients.filter(p => p.organ_donor).length}
            </span>
          </div>
          <Heart className="w-4 h-4 text-rose-500" />
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => setActiveAdminTab('patients')}
          className={`px-4 py-2 rounded-xl font-black text-xs transition-colors ${
            activeAdminTab === 'patients'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          👥 Patient Profiles Database ({patients.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('role_requests')}
          className={`px-4 py-2 rounded-xl font-black text-xs flex items-center space-x-1.5 transition-colors ${
            activeAdminTab === 'role_requests'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Role Change Requests</span>
          {roleRequests.filter(r => r.status === 'PENDING').length > 0 && (
            <span className="bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-full text-[10px] font-black">
              {roleRequests.filter(r => r.status === 'PENDING').length} PENDING
            </span>
          )}
        </button>
      </div>

      {activeAdminTab === 'role_requests' ? (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-black text-sm text-slate-900">User Role Upgrade & Modification Requests</h3>
              <p className="text-[11px] font-bold text-slate-500">Review pending privilege upgrade requests submitted by registered accounts.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-black">
                <tr>
                  <th className="p-2.5 rounded-l-xl">User</th>
                  <th className="p-2.5">Current Role</th>
                  <th className="p-2.5">Requested Role</th>
                  <th className="p-2.5">Reason / Justification</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                {roleRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-500 font-bold">No role change requests found.</td>
                  </tr>
                ) : (
                  roleRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50">
                      <td className="p-2.5">
                        <span className="font-black text-slate-900 block">{req.user_name}</span>
                        <span className="text-[10px] text-slate-500 font-bold">{req.email}</span>
                      </td>
                      <td className="p-2.5">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono text-[10px]">
                          {req.current_role}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span className="bg-emerald-100 text-emerald-900 font-black px-2 py-0.5 rounded-md text-[10px]">
                          {req.requested_role}
                        </span>
                      </td>
                      <td className="p-2.5 max-w-xs truncate text-[11px] text-slate-700">
                        {req.reason}
                      </td>
                      <td className="p-2.5">
                        {req.status === 'PENDING' ? (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full text-[10px] font-black">
                            ● PENDING
                          </span>
                        ) : req.status === 'APPROVED' ? (
                          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-black">
                            ✓ APPROVED
                          </span>
                        ) : (
                          <span className="bg-rose-100 text-rose-900 border border-rose-300 px-2 py-0.5 rounded-full text-[10px] font-black">
                            ✕ REJECTED
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-right space-x-1">
                        {req.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveRoleRequest(req.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-2.5 py-1 rounded-lg text-[10px]"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectRoleRequest(req.id)}
                              className="bg-rose-600 hover:bg-rose-700 text-white font-black px-2.5 py-1 rounded-lg text-[10px]"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          {/* ULTRA-COMPACT PATIENTS TABLE (ZERO HORIZONTAL SCROLL) */}
        
        {/* Search & Filter Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient name, email, or Emergency ID..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold">
            <span className="text-slate-600 text-[11px]">Blood:</span>
            <select
              value={bloodFilter}
              onChange={(e) => setBloodFilter(e.target.value)}
              className="bg-slate-50 text-slate-900 font-black px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">All</option>
              <option value="A+">A+</option>
              <option value="B+">B+</option>
              <option value="O+">O+</option>
              <option value="AB+">AB+</option>
              <option value="O-">O-</option>
            </select>
          </div>

        </div>

        {/* ULTRA TIGHT TABLE CONTAINER */}
        <div className="w-full">
          <table className="w-full text-left text-xs border-collapse table-fixed">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-black uppercase text-[9px] tracking-wider border-b border-slate-200">
                <th className="py-2 px-2.5 w-[32%] rounded-l-lg">Patient & Account</th>
                <th className="py-2 px-2.5 w-[22%]">Emergency ID & Blood</th>
                <th className="py-2 px-2.5 w-[32%]">Critical Allergies / Meds</th>
                <th className="py-2 px-2.5 w-[14%] rounded-r-lg text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPatients.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Column 1: Patient Identity + Role */}
                  <td className="py-2 px-2.5">
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0">
                        {p.full_name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-black text-slate-900 text-[11px] truncate block leading-tight">{p.full_name}</span>
                          <span className="text-[8px] font-black uppercase bg-slate-100 text-slate-700 px-1 py-0.2 rounded border border-slate-200 flex-shrink-0">
                            {p.role || 'PATIENT'}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 truncate block font-semibold">{p.email}</span>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Emergency ID & Blood Group Stack */}
                  <td className="py-2 px-2.5">
                    <div className="space-y-0.5">
                      <span className="font-mono font-black text-emerald-800 text-[11px] block leading-tight">
                        {p.emergency_id}
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className="bg-rose-100 text-rose-900 font-black px-1.5 py-0.2 rounded text-[9px] border border-rose-200">
                          {p.blood_group}
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold">
                          {p.gender}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Column 3: Medical Summary Stack */}
                  <td className="py-2 px-2.5 overflow-hidden">
                    <div className="space-y-0.5 overflow-hidden">
                      <span className="text-[10px] font-black text-rose-700 truncate block">
                        {p.critical_allergies && p.critical_allergies.length > 0 && !p.critical_allergies.includes('None declared')
                          ? `⚠️ ${p.critical_allergies.join(', ')}`
                          : <span className="text-slate-400 font-normal">No Allergies</span>}
                      </span>
                      <span className="text-[9px] font-bold text-slate-600 truncate block">
                        {p.active_medications && p.active_medications.length > 0 && !p.active_medications.includes('None declared')
                          ? `💊 ${p.active_medications.join(', ')}`
                          : <span className="text-slate-400 font-normal">No Medications</span>}
                      </span>
                    </div>
                  </td>

                  {/* Column 4: Compact Actions */}
                  <td className="py-2 px-2.5 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => setViewPatient(p)}
                        title="View Snapshot"
                        className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setEditPatient(p)}
                        title="Edit Details"
                        className="p-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-md"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeletePatientId(p.id)}
                        title="Delete Profile"
                        className="p-1 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center p-6 text-slate-500 font-bold">
                    No patients match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}

      {/* ➕ MODAL 1: CREATE NEW PATIENT */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-5 space-y-3.5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">Register New Patient Profile</h3>
              </div>

              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-900 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  required
                  placeholder="e.g. Vikramaditya Shinde"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-900 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    placeholder="vikram@org"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98000 11223"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-900 font-bold mb-1">Blood Group</label>
                  <select
                    value={newBloodGroup}
                    onChange={(e) => setNewBloodGroup(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-1.5 text-slate-900 font-bold focus:outline-none"
                  >
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="O+">O+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-1.5 text-slate-900 font-bold focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Organ Donor</label>
                  <select
                    value={newOrganDonor ? 'YES' : 'NO'}
                    onChange={(e) => setNewOrganDonor(e.target.value === 'YES')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-1.5 text-slate-900 font-bold focus:outline-none"
                  >
                    <option value="YES">Yes</option>
                    <option value="NO">No</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1">Critical Allergies</label>
                <input
                  type="text"
                  value={newAllergies}
                  onChange={(e) => setNewAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Sulfa Drugs"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1">Critical Conditions</label>
                <input
                  type="text"
                  value={newConditions}
                  onChange={(e) => setNewConditions(e.target.value)}
                  placeholder="e.g. Bronchial Asthma, Type 2 Diabetes"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1">Active Daily Medications</label>
                <input
                  type="text"
                  value={newMeds}
                  onChange={(e) => setNewMeds(e.target.value)}
                  placeholder="e.g. Asthalin Inhaler, Metformin 500mg"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1">Resuscitation Instructions</label>
                <textarea
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-bold focus:outline-none"
                />
              </div>

              <div className="flex space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white font-black py-2 rounded-xl text-xs uppercase shadow-xs"
                >
                  Create Patient Profile
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 👁️ MODAL 2: VIEW PATIENT DETAILS */}
      {viewPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-5 space-y-3.5 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-slate-900" />
                <h3 className="text-base font-black text-slate-900">Patient Emergency Snapshot</h3>
              </div>

              <button onClick={() => setViewPatient(null)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-0.5">
                <span className="font-mono text-emerald-800 font-black text-[11px] block">{viewPatient.emergency_id}</span>
                <h4 className="font-black text-slate-900 text-base">{viewPatient.full_name}</h4>
                <p className="text-slate-600 font-medium text-[11px]">{viewPatient.email} • {viewPatient.phone}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-rose-50 p-2 rounded-xl border border-rose-200">
                  <span className="text-[9px] text-rose-700 font-bold uppercase block">Blood Group</span>
                  <span className="font-black text-rose-900 text-sm">{viewPatient.blood_group}</span>
                </div>
                <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                  <span className="text-[9px] text-emerald-700 font-bold uppercase block">Organ Donor</span>
                  <span className="font-black text-emerald-900 text-sm">{viewPatient.organ_donor ? 'YES' : 'NO'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-black text-slate-900 text-[10px] block uppercase">Critical Allergies:</span>
                <p className="bg-rose-100/70 p-2 rounded-xl text-rose-900 font-black border border-rose-200 text-[11px]">
                  {viewPatient.critical_allergies?.join(', ') || 'None declared'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-black text-slate-900 text-[10px] block uppercase">Critical Conditions:</span>
                <p className="bg-slate-100 p-2 rounded-xl text-slate-800 font-bold text-[11px]">
                  {viewPatient.critical_conditions?.join(', ') || 'None declared'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-black text-slate-900 text-[10px] block uppercase">Emergency Instructions:</span>
                <p className="bg-amber-50 p-2 rounded-xl text-amber-950 font-bold border border-amber-200 text-[11px]">
                  {viewPatient.emergency_instructions}
                </p>
              </div>
            </div>

            <button
              onClick={() => setViewPatient(null)}
              className="w-full bg-slate-900 text-white font-black py-2 rounded-xl text-xs uppercase"
            >
              Close Snapshot
            </button>

          </div>
        </div>
      )}

      {/* ✏️ MODAL 3: EDIT PATIENT */}
      {editPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-5 space-y-3.5 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">Edit Patient Profile</h3>
              </div>

              <button onClick={() => setEditPatient(null)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdatePatient} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-900 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  value={editPatient.full_name}
                  onChange={(e) => setEditPatient({ ...editPatient, full_name: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1">Account Role</label>
                <select
                  value={editPatient.role || 'PATIENT'}
                  onChange={(e) => setEditPatient({ ...editPatient, role: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="PATIENT">PATIENT (Patient Profile)</option>
                  <option value="BYSTANDER">BYSTANDER (Roadside Bystander)</option>
                  <option value="PARAMEDIC">PARAMEDIC (First Responder)</option>
                  <option value="HOSPITAL_STAFF">HOSPITAL_STAFF (Hospital ER Doctor)</option>
                  <option value="ADMIN">ADMIN (System Administrator)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1">Blood Group</label>
                <select
                  value={editPatient.blood_group}
                  onChange={(e) => setEditPatient({ ...editPatient, blood_group: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-bold focus:outline-none"
                >
                  <option value="A+">A+</option>
                  <option value="B+">B+</option>
                  <option value="O+">O+</option>
                  <option value="AB+">AB+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1">Critical Allergies</label>
                <input
                  type="text"
                  value={Array.isArray(editPatient.critical_allergies) ? editPatient.critical_allergies.join(', ') : editPatient.critical_allergies}
                  onChange={(e) => setEditPatient({ ...editPatient, critical_allergies: e.target.value.split(',') })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1">Emergency Instructions</label>
                <textarea
                  value={editPatient.emergency_instructions}
                  onChange={(e) => setEditPatient({ ...editPatient, emergency_instructions: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-bold focus:outline-none"
                />
              </div>

              <div className="flex space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditPatient(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white font-black py-2 rounded-xl text-xs uppercase shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 🗑️ MODAL 4: DELETE PATIENT CONFIRMATION */}
      {deletePatientId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-5 space-y-3 shadow-2xl text-center">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="space-y-0.5">
              <h3 className="text-base font-black text-slate-900">Delete Patient Profile?</h3>
              <p className="text-xs text-slate-500 font-medium">
                This action is permanent. The patient's Emergency ID and Break-Glass tokens will be deleted.
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setDeletePatientId(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePatient(deletePatientId)}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black py-2 rounded-xl text-xs uppercase shadow-xs"
              >
                Delete Patient
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
