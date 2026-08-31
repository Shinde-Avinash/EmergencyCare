import React from 'react';
import { EmergencyProvider, useEmergency } from './context/EmergencyContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { EmergencyIdentityView } from './components/EmergencyIdentityView';
import { BreakGlassScannerView } from './components/BreakGlassScannerView';
import { IncidentManagerView } from './components/IncidentManagerView';
import { HospitalRoutingView } from './components/HospitalRoutingView';
import { MedicalRecordsView } from './components/MedicalRecordsView';
import { AuditLedgerView } from './components/AuditLedgerView';
import { CareCircleView } from './components/CareCircleView';
import { ProfileView } from './components/ProfileView';
import { AuthView } from './components/AuthView';
import { AdminPatientManagementView } from './components/AdminPatientManagementView';

const MainContent: React.FC = () => {
  const { activeTab } = useEmergency();

  return (
    <main className="flex-1 p-2 sm:p-6 max-w-6xl mx-auto w-full overflow-x-hidden">
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'admin-patients' && <AdminPatientManagementView />}
      {activeTab === 'identity' && <EmergencyIdentityView />}
      {activeTab === 'scanner' && <BreakGlassScannerView />}
      {activeTab === 'profile' && <ProfileView />}
      {activeTab === 'incident' && <IncidentManagerView />}
      {activeTab === 'hospitals' && <HospitalRoutingView />}
      {activeTab === 'records' && <MedicalRecordsView />}
      {activeTab === 'audit' && <AuditLedgerView />}
      {activeTab === 'care' && <CareCircleView />}
    </main>
  );
};

const AuthenticatedAppLayout: React.FC = () => {
  const { authUser } = useEmergency();

  // STRICT LOGIN WALL: If unauthenticated, render ONLY AuthView!
  if (!authUser) {
    return (
      <div className="min-h-screen bg-[#d6e6e3] flex items-center justify-center p-4">
        <AuthView />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#d6e6e3] text-slate-900 font-sans p-3 sm:p-6 flex justify-center items-start">
      {/* Floating Healthcare Frame matching Reference UI */}
      <div className="w-full max-w-7xl bg-[#ebf3f1] rounded-[32px] p-4 sm:p-6 shadow-xl border border-[#d3e4e0]/60 flex flex-col lg:flex-row gap-6 min-h-[92vh]">
        <Navbar />
        <MainContent />
      </div>
    </div>
  );
};

export function App() {
  return (
    <EmergencyProvider>
      <AuthenticatedAppLayout />
    </EmergencyProvider>
  );
}

export default App;
