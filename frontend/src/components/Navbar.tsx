import React, { useState } from 'react';
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
  UserCheck,
  Menu,
  X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentRole, 
    setCurrentRole, 
    language,
    setLanguage,
    t,
    activeTab, 
    setActiveTab, 
    authUser, 
    logoutUser,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    sessionRemainingSeconds
  } = useEmergency();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const role = authUser?.role || currentRole || 'PATIENT';

  const mins = Math.floor(sessionRemainingSeconds / 60);
  const secs = sessionRemainingSeconds % 60;
  const formattedTimer = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  // Role-Based Menu Visibility Flags
  const isPatient = role === 'PATIENT';
  const isBystander = role === 'BYSTANDER';
  const isParamedic = role === 'PARAMEDIC';
  const isDoctor = role === 'HOSPITAL_STAFF';
  const isAdmin = role === 'ADMIN';

  const handleTabClick = (tabKey: string) => {
    setActiveTab(tabKey);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* MOBILE & TABLET TOP HEADER BAR (< lg) */}
      <div className="lg:hidden w-full bg-[#e5f0ed] p-3 rounded-2xl border border-[#d3e4e0]/80 shadow-sm flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => {
              if (isAdmin) handleTabClick('admin-patients');
              else if (isBystander || isParamedic) handleTabClick('scanner');
              else handleTabClick('dashboard');
            }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-emerald-400 flex items-center justify-center text-slate-900 shadow-xs font-black text-xs">
              ⚡
            </div>
            <h1 className="font-black text-base text-slate-900 tracking-tight">
              {t('app_title')}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            {/* Session Timer Badge (Mobile) */}
            <div className="bg-amber-50 border border-amber-200 px-2 py-1 rounded-xl text-[10px] font-black text-amber-900 shadow-2xs flex items-center space-x-1" title="15-min Inactivity Session Timeout">
              <span>⏱️</span>
              <span>{formattedTimer}</span>
            </div>

            {/* Global Language Selector (Mobile) */}
            <div className="bg-white border border-slate-300 rounded-xl px-2 py-1 text-xs shadow-2xs flex items-center space-x-1">
              <span className="text-[11px]">🌐</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-transparent font-black text-slate-900 focus:outline-none cursor-pointer text-xs"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="mr">मराठी</option>
              </select>
            </div>

            <span className="text-[10px] font-black bg-white text-emerald-900 px-2.5 py-1 rounded-full border border-slate-200 uppercase tracking-wider">
              {role}
            </span>

            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="p-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 shadow-2xs border border-slate-200"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* MOBILE NAVIGATION DRAWER */}
        {isMobileMenuOpen && (
          <div className="pt-2 border-t border-[#d3e4e0] space-y-1 animate-fadeIn">
            {isAdmin && (
              <button
                onClick={() => handleTabClick('admin-patients')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                  activeTab === 'admin-patients' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t('admin_patients')}</span>
                </div>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => handleTabClick('audit')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'audit' ? 'bg-slate-900 text-white font-black' : 'bg-white text-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Lock className="w-4 h-4 text-slate-800" />
                  <span>{t('audit_ledger')}</span>
                </div>
              </button>
            )}

            {(isPatient || isParamedic || isDoctor || isAdmin) && (
              <button
                onClick={() => handleTabClick('dashboard')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'dashboard' ? 'bg-slate-900 text-white font-black' : 'bg-white text-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <LayoutDashboard className="w-4 h-4 text-slate-800" />
                  <span>{t('dashboard')}</span>
                </div>
              </button>
            )}

            {isPatient && (
              <button
                onClick={() => handleTabClick('profile')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'profile' ? 'bg-slate-900 text-white font-black' : 'bg-white text-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <User className="w-4 h-4 text-slate-800" />
                  <span>{t('profile')}</span>
                </div>
              </button>
            )}

            {isPatient && (
              <button
                onClick={() => handleTabClick('identity')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'identity' ? 'bg-slate-900 text-white font-black' : 'bg-white text-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <QrCode className="w-4 h-4 text-slate-800" />
                  <span>{t('qr_identity')}</span>
                </div>
              </button>
            )}

            {isPatient && (
              <button
                onClick={() => handleTabClick('care')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'care' ? 'bg-slate-900 text-white font-black' : 'bg-white text-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Users className="w-4 h-4 text-slate-800" />
                  <span>{t('care_circle')}</span>
                </div>
              </button>
            )}

            {(isBystander || isParamedic || isDoctor) && (
              <button
                onClick={() => handleTabClick('scanner')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                  activeTab === 'scanner' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-900'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Scan className="w-4 h-4" />
                  <span>🚨 {t('scanner')}</span>
                </div>
              </button>
            )}

            {(isPatient || isParamedic || isDoctor) && (
              <button
                onClick={() => handleTabClick('hospitals')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'hospitals' ? 'bg-slate-900 text-white font-black' : 'bg-white text-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Building2 className="w-4 h-4 text-slate-800" />
                  <span>{t('hospital_routing')}</span>
                </div>
              </button>
            )}

            {(isPatient || isDoctor) && (
              <button
                onClick={() => handleTabClick('records')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'records' ? 'bg-slate-900 text-white font-black' : 'bg-white text-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <FileText className="w-4 h-4 text-slate-800" />
                  <span>{t('medical_records')}</span>
                </div>
              </button>
            )}

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between px-2">
              <span className="text-xs font-bold text-slate-900">{authUser?.name || 'User Account'}</span>
              <button
                onClick={logoutUser}
                className="bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('logout')}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP SIDEBAR NAVIGATION (≥ lg) */}
      <aside className={`hidden lg:block bg-[#e5f0ed] p-3 rounded-2xl border border-[#d3e4e0]/80 shadow-sm transition-all duration-300 self-start overflow-hidden ${
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

        {/* Session Inactivity Countdown Badge (Desktop) */}
        {!isSidebarCollapsed ? (
          <div className="bg-amber-50/90 border border-amber-200/80 p-2 rounded-xl flex items-center justify-between shadow-2xs text-[11px]" title="Auto-logout after 15 minutes of inactivity">
            <span className="font-bold text-amber-900 flex items-center space-x-1">
              <span>⏱️</span>
              <span>{t('session_timer')}:</span>
            </span>
            <span className="font-mono font-black text-amber-950 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
              {formattedTimer}
            </span>
          </div>
        ) : (
          <div className="flex justify-center text-[10px] font-black text-amber-900 bg-amber-100 p-1 rounded-lg border border-amber-200" title={`Session expires in ${formattedTimer}`}>
            ⏱️ {mins}m
          </div>
        )}

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
                  {!isSidebarCollapsed && <span>{t('dashboard')}</span>}
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
                  {!isSidebarCollapsed && <span>{t('profile')}</span>}
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
                  {!isSidebarCollapsed && <span>{t('qr_identity')}</span>}
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
                  {!isSidebarCollapsed && <span>{t('care_circle')}</span>}
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
                  {!isSidebarCollapsed && <span>{t('scanner')}</span>}
                </div>
                {!isSidebarCollapsed && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
              </button>
            )}

            {/* 8. NEAREST HOSPITALS & ER MAP (Patient, Paramedic, Doctor) */}
            {(isPatient || isParamedic || isDoctor) && (
              <button
                onClick={() => setActiveTab('hospitals')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'} py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  activeTab === 'hospitals'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-extrabold'
                    : 'text-slate-700 hover:bg-white/60 hover:text-slate-900'
                }`}
                title={isPatient ? "Nearest Hospitals Map" : "Hospital ER Dispatch"}
              >
                <div className="flex items-center space-x-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-800" />
                  {!isSidebarCollapsed && <span>{t('hospital_routing')}</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-900 text-white text-[8px] font-black flex items-center justify-center">
                    8
                  </span>
                )}
              </button>
            )}

            {/* 9. HEALTH RECORDS (Patient, Doctor) */}
            {(isPatient || isDoctor) && (
              <button
                onClick={() => setActiveTab('records')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'} py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  activeTab === 'records'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-extrabold'
                    : 'text-slate-700 hover:bg-white/60 hover:text-slate-900'
                }`}
                title="Health Records"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-3.5 h-3.5 text-slate-800" />
                  {!isSidebarCollapsed && <span>{t('medical_records')}</span>}
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
        <div className="pt-2 space-y-2 border-t border-[#d3e4e0]/60">
          
          {/* Global Language Selector (Desktop Sidebar) */}
          {!isSidebarCollapsed ? (
            <div className="bg-white p-2 rounded-xl border border-slate-200/80 flex items-center justify-between shadow-2xs">
              <span className="text-xs font-black text-slate-800 flex items-center space-x-1">
                <span>🌐</span>
                <span>{t('language_select')}:</span>
              </span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-slate-100 font-black text-slate-900 text-xs px-2.5 py-1 rounded-lg border border-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="mr">मराठी</option>
              </select>
            </div>
          ) : (
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : language === 'hi' ? 'mr' : 'en')}
              title={`Switch Language: ${language.toUpperCase()}`}
              className="w-full flex justify-center p-1.5 rounded-lg bg-white font-black text-xs text-slate-900 shadow-2xs"
            >
              🌐 {language.toUpperCase()}
            </button>
          )}

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
                    <span className="text-[9px] font-black text-emerald-800 uppercase tracking-wider block">
                      {role}
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
    </>
  );
};
