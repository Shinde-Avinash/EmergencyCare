import React from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Scan, 
  QrCode, 
  FileText, 
  Lock, 
  Users, 
  User, 
  LogOut, 
  Building2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentRole, 
    setCurrentRole, 
    activeTab, 
    setActiveTab, 
    authUser, 
    logoutUser,
    isSidebarCollapsed,
    setIsSidebarCollapsed
  } = useEmergency();

  const role = authUser?.role || currentRole || 'PATIENT';

  // Role-Based Menu Visibility Flags
  const isPatient = role === 'PATIENT';
  const isBystander = role === 'BYSTANDER';
  const isParamedic = role === 'PARAMEDIC';
  const isDoctor = role === 'HOSPITAL_STAFF';
  const isAdmin = role === 'ADMIN';

  return (
    <aside className={`bg-[#e5f0ed] p-3 rounded-2xl border border-[#d3e4e0]/80 shadow-sm transition-all duration-300 self-start overflow-hidden ${
      isSidebarCollapsed ? 'w-14' : 'w-52'
    }`}>
      
      <div className="space-y-2.5">
        
        {/* Header & Collapse Toggle */}
        <div className="flex items-center justify-between border-b border-[#d3e4e0]/60 pb-2">
          {!isSidebarCollapsed && (
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => {
                if (isAdmin) setActiveTab('admin-patients');
                else if (isBystander || isParamedic) setActiveTab('scanner');
                else setActiveTab('dashboard');
              }}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-emerald-400 flex items-center justify-center text-slate-900 shadow-sm font-black text-xs">
                ⚡
              </div>
              <h1 className="font-black text-sm text-slate-900 tracking-tight">
                Emergency<span className="text-emerald-700">Care</span>
              </h1>
            </div>
          )}

          {isSidebarCollapsed && (
            <div 
              className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-emerald-400 flex items-center justify-center text-slate-900 shadow-sm font-black text-xs mx-auto cursor-pointer"
              onClick={() => {
                if (isAdmin) setActiveTab('admin-patients');
                else if (isBystander || isParamedic) setActiveTab('scanner');
                else setActiveTab('dashboard');
              }}
            >
              ⚡
            </div>
          )}

          <button
            onClick={() => setIsSidebarCollapsed(prev => !prev)}
            className="p-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 transition-colors shadow-sm"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* ROLE-BASED SEGREGATED NAVIGATION MENU */}
        <div className="space-y-0.5">
          {!isSidebarCollapsed && (
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider px-1.5 block">
              {isAdmin ? "Admin Console" : (isBystander ? "Emergency Portal" : "Navigation")}
            </span>
          )}

          <nav className="space-y-0.5">
            
            {/* 1. ADMIN PATIENT DATABASE (Admin Only) */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin-patients')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'} py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  activeTab === 'admin-patients'
                    ? 'bg-slate-900 text-white shadow-sm font-black'
                    : 'bg-emerald-100/70 text-emerald-950 hover:bg-emerald-200/80'
                }`}
                title="Admin Patients Database"
              >
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-3.5 h-3.5" />
                  {!isSidebarCollapsed && <span>Admin Patients</span>}
                </div>
              </button>
            )}

            {/* 2. SECURITY AUDIT LOG (Admin Only) */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('audit')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'} py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  activeTab === 'audit'
                    ? 'bg-slate-900 text-white shadow-sm font-black'
                    : 'text-slate-700 hover:bg-white/60 hover:text-slate-900'
                }`}
                title="Security Audit Log"
              >
                <div className="flex items-center space-x-2">
                  <Lock className="w-3.5 h-3.5 text-slate-800" />
                  {!isSidebarCollapsed && <span>Audit Ledger</span>}
                </div>
              </button>
            )}

            {/* 3. DASHBOARD (Patient, Paramedic, Doctor, Admin) */}
            {(isPatient || isParamedic || isDoctor || isAdmin) && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'} py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-extrabold'
                    : 'text-slate-700 hover:bg-white/60 hover:text-slate-900'
                }`}
                title="Dashboard"
              >
                <div className="flex items-center space-x-2">
                  <LayoutDashboard className="w-3.5 h-3.5 text-slate-800" />
                  {!isSidebarCollapsed && <span>Dashboard</span>}
                </div>
              </button>
            )}

            {/* 4. MY PROFILE (Patient Only) */}
            {isPatient && (
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'} py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-extrabold'
                    : 'text-slate-700 hover:bg-white/60 hover:text-slate-900'
                }`}
                title="My Profile"
              >
                <div className="flex items-center space-x-2">
                  <User className="w-3.5 h-3.5 text-slate-800" />
                  {!isSidebarCollapsed && <span>My Profile</span>}
                </div>
              </button>
            )}

            {/* 5. QR & NFC IDENTITY (Patient Only) */}
            {isPatient && (
              <button
                onClick={() => setActiveTab('identity')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'} py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  activeTab === 'identity'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-extrabold'
                    : 'text-slate-700 hover:bg-white/60 hover:text-slate-900'
                }`}
                title="QR & NFC Identity"
              >
                <div className="flex items-center space-x-2">
                  <QrCode className="w-3.5 h-3.5 text-slate-800" />
                  {!isSidebarCollapsed && <span>QR & NFC Cards</span>}
                </div>
              </button>
            )}

            {/* 6. CARE CIRCLE (Patient Only) */}
            {isPatient && (
              <button
                onClick={() => setActiveTab('care')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'} py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  activeTab === 'care'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-extrabold'
                    : 'text-slate-700 hover:bg-white/60 hover:text-slate-900'
                }`}
                title="Family Care Circle"
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-3.5 h-3.5 text-slate-800" />
                  {!isSidebarCollapsed && <span>Care Circle</span>}
                </div>
              </button>
            )}

            {/* 7. BREAK-GLASS EMERGENCY SCANNER (Bystander, Paramedic, Doctor) */}
            {(isBystander || isParamedic || isDoctor) && (
              <button
                onClick={() => setActiveTab('scanner')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'} py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  activeTab === 'scanner'
                    ? 'bg-rose-600 text-white shadow-sm font-black'
                    : 'bg-rose-50/80 text-rose-800 border border-rose-200/60 hover:bg-rose-100'
                }`}
                title="🚨 Break-Glass Access"
              >
                <div className="flex items-center space-x-2">
                  <Scan className="w-3.5 h-3.5" />
                  {!isSidebarCollapsed && <span>Break-Glass</span>}
                </div>
                {!isSidebarCollapsed && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
              </button>
            )}

            {/* 8. HOSPITAL ER & DISPATCH (Paramedic, Doctor) */}
            {(isParamedic || isDoctor) && (
              <button
                onClick={() => setActiveTab('hospitals')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'} py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  activeTab === 'hospitals'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-extrabold'
                    : 'text-slate-700 hover:bg-white/60 hover:text-slate-900'
                }`}
                title="Hospital ER Dispatch"
              >
                <div className="flex items-center space-x-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-800" />
                  {!isSidebarCollapsed && <span>Hospital ER</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-900 text-white text-[8px] font-black flex items-center justify-center">
                    8
                  </span>
                )}
              </button>
            )}

            {/* 9. AI CLINICAL DOCUMENTS (Doctor Only) */}
            {isDoctor && (
              <button
                onClick={() => setActiveTab('records')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'} py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  activeTab === 'records'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-extrabold'
                    : 'text-slate-700 hover:bg-white/60 hover:text-slate-900'
                }`}
                title="AI Clinical Docs"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-3.5 h-3.5 text-slate-800" />
                  {!isSidebarCollapsed && <span>AI Docs</span>}
                </div>
              </button>
            )}

          </nav>
        </div>

        {/* Compact Readiness Pill (Patient Only) */}
        {isPatient && !isSidebarCollapsed && (
          <div className="bg-gradient-to-br from-[#c6ebd9] via-[#b6e5d0] to-[#e4f3aa] p-2.5 rounded-xl border border-[#aadeca]/60 flex justify-between items-center text-[10px]">
            <span className="font-black text-slate-900">Readiness:</span>
            <span className="text-slate-900 font-black bg-white/80 px-2 py-0.5 rounded-md shadow-2xs">85 / 100</span>
          </div>
        )}

        {/* User Profile Card & Role Switcher */}
        <div className="pt-2 space-y-1.5 border-t border-[#d3e4e0]/60">
          {!isSidebarCollapsed ? (
            <>
              <div className="bg-white p-1.5 rounded-xl border border-slate-200/80 flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-1.5 overflow-hidden">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0">
                    {authUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <span className="font-black text-slate-900 text-[11px] block leading-tight truncate">
                      {authUser?.name || 'User Account'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logoutUser}
                  title="Log Out"
                  className="text-slate-400 hover:text-rose-600 p-0.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-[#dae9e6] px-2 py-0.5 rounded-lg flex items-center justify-between text-[10px]">
                <span className="font-black text-slate-600 uppercase text-[8px]">Active Role:</span>
                <select
                  value={currentRole}
                  onChange={(e) => {
                    const newRole = e.target.value as UserRole;
                    setCurrentRole(newRole);
                    // Route to role-suited default tab
                    if (newRole === 'ADMIN') setActiveTab('admin-patients');
                    else if (newRole === 'BYSTANDER' || newRole === 'PARAMEDIC') setActiveTab('scanner');
                    else if (newRole === 'HOSPITAL_STAFF') setActiveTab('hospitals');
                    else setActiveTab('dashboard');
                  }}
                  className="bg-transparent text-slate-900 font-black text-[10px] focus:outline-none cursor-pointer"
                >
                  <option value="PATIENT">Patient</option>
                  <option value="BYSTANDER">Bystander</option>
                  <option value="PARAMEDIC">Paramedic</option>
                  <option value="HOSPITAL_STAFF">ER Doctor</option>
                  <option value="ADMIN">System Admin</option>
                </select>
              </div>
            </>
          ) : (
            <button
              onClick={logoutUser}
              title="Log Out"
              className="w-full flex justify-center p-1.5 rounded-lg bg-white text-slate-700 hover:text-rose-600 shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

    </aside>
  );
};
