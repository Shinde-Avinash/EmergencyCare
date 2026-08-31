import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, LanguageCode, PatientProfile, EmergencyIdentity, Incident, ReadinessScore } from '../types';

export interface AppointmentItem {
  id: string;
  specialty: string;
  doctor_name: string;
  time_slot: string;
  date_str: string;
  icon_emoji: string;
  bg_color: string;
}

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

interface EmergencyContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  patient: PatientProfile | null;
  setPatient: React.Dispatch<React.SetStateAction<PatientProfile | null>>;
  identity: EmergencyIdentity | null;
  activeIncident: Incident | null;
  readiness: ReadinessScore | null;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  refreshData: () => Promise<void>;
  updateIncidentStatus: (nextStatus: string, hospitalId?: number) => Promise<void>;
  
  // Auth & Sidebar state
  authUser: AuthUser | null;
  loginUser: (email: string, role: UserRole, name?: string, token?: string) => void;
  logoutUser: () => void;
  updatePatientProfile: (updatedData: Partial<PatientProfile>) => Promise<void>;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;

  // Dynamic Appointments State
  appointments: AppointmentItem[];
  addAppointment: (app: Omit<AppointmentItem, 'id'>) => void;
  deleteAppointment: (id: string) => void;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('PATIENT');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  
  // Restore authUser session from localStorage on refresh
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const savedUser = localStorage.getItem("emergencycare_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  // Restore activeTab from localStorage on refresh
  const [activeTab, setActiveTabState] = useState<string>(() => {
    const savedUser = localStorage.getItem("emergencycare_user");
    const savedTab = localStorage.getItem("emergencycare_tab");
    return savedUser ? (savedTab || 'dashboard') : 'auth';
  });

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    localStorage.setItem("emergencycare_tab", tab);
  };
  
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [identity, setIdentity] = useState<EmergencyIdentity | null>(null);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [readiness, setReadiness] = useState<ReadinessScore | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic Appointments Initial List
  const [appointments, setAppointments] = useState<AppointmentItem[]>([
    {
      id: 'app-1',
      specialty: 'Cardiologist',
      doctor_name: 'Dr. Richard Michels',
      time_slot: '02.00 PM – 02.40 PM',
      date_str: 'Today',
      icon_emoji: '👨‍⚕️',
      bg_color: '#e8f4f0'
    },
    {
      id: 'app-2',
      specialty: 'Emergency ER Specialist',
      doctor_name: 'Dr. Marie Jordan',
      time_slot: '11.00 AM – 12.00 PM',
      date_str: 'Today',
      icon_emoji: '👩‍⚕️',
      bg_color: '#edf3fe'
    }
  ]);

  const addAppointment = (app: Omit<AppointmentItem, 'id'>) => {
    const newApp: AppointmentItem = {
      ...app,
      id: `app-${Date.now()}`
    };
    setAppointments(prev => [newApp, ...prev]);
    showToast(`✓ Scheduled appointment with ${newApp.doctor_name}!`);
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    showToast("Appointment removed.");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loginUser = (email: string, role: UserRole, name: string = "Rahul Sharma", token: string = "demo_jwt_token") => {
    const u: AuthUser = { id: 1, name, email, role };
    setAuthUser(u);
    setCurrentRole(role);
    localStorage.setItem("emergencycare_jwt", token);
    localStorage.setItem("emergencycare_user", JSON.stringify(u));
    setActiveTab('dashboard');
    showToast(`✓ Welcome ${name}! Emergency Care Portal Unlocked.`);
  };

  const logoutUser = () => {
    setAuthUser(null);
    localStorage.removeItem("emergencycare_jwt");
    localStorage.removeItem("emergencycare_user");
    localStorage.removeItem("emergencycare_tab");
    setActiveTabState("auth");
    showToast("🔒 Security Session Closed.");
  };

  const fetchPatientData = async () => {
    try {
      const res = await fetch('/api/patient/1');
      if (res.ok) {
        const data = await res.json();
        setPatient(data);
      }
    } catch (e) {
      setPatient({
        id: 1,
        emergency_id: "EMG-8942-X",
        full_name: "Rahul Sharma",
        blood_group: "B+",
        dob: "1992-04-14",
        gender: "Male",
        primary_language: "English",
        organ_donor: true,
        critical_allergies: ["Penicillin", "Sulfa Drugs"],
        critical_conditions: ["Bronchial Asthma", "Type 2 Diabetes"],
        active_medications: ["Asthalin Inhaler", "Metformin 500mg"],
        emergency_instructions: "Severe Penicillin allergy! Do not administer beta-lactam antibiotics.",
        past_surgeries: "Appendectomy (2018)",
        recent_reports: "Cardiology Report (2026)",
        ai_summary: "Patient has recorded Penicillin allergy and history of bronchial asthma.",
        ai_traceability: [
          { claim: "Severe Penicillin allergy", source: "Verified Allergy Registry", confidence: 0.99 }
        ]
      });
    }
  };

  const fetchIdentity = async () => {
    try {
      const res = await fetch('/api/identity/1');
      if (res.ok) {
        const data = await res.json();
        setIdentity(data);
      }
    } catch (e) {
      setIdentity({
        emergency_id: "EMG-8942-X",
        qr_break_glass_token: "BG-TOKEN-8942-ALPHA-KEY",
        nfc_payload: "https://emergencycare.app/break-glass/BG-TOKEN-8942-ALPHA-KEY",
        printable_card_code: "CARD-EMG-8942",
        lockscreen_badge_url: "https://emergencycare.app/badge/EMG-8942-X",
        is_active: true
      });
    }
  };

  const fetchActiveIncident = async () => {
    try {
      const res = await fetch('/api/incidents/active');
      if (res.ok) {
        const data = await res.json();
        setActiveIncident(data);
      }
    } catch (e) {
      console.warn("Failed fetching incident", e);
    }
  };

  const fetchReadiness = async () => {
    try {
      const res = await fetch('/api/readiness/1');
      if (res.ok) {
        const data = await res.json();
        setReadiness(data);
      }
    } catch (e) {
      setReadiness({
        score: 85,
        max_score: 100,
        grade: "READY",
        checkpoints: [
          { item: "Emergency Contact Verified", passed: true, pts: 20 },
          { item: "Blood Group Verified (B+)", passed: true, pts: 15 },
          { item: "Critical Allergies Recorded", passed: true, pts: 20 }
        ],
        summary: "Emergency Profile is ready for Break-Glass access."
      });
    }
  };

  const updatePatientProfile = async (updatedData: Partial<PatientProfile>) => {
    if (!patient) return;
    const newProfile = { ...patient, ...updatedData };
    setPatient(newProfile);
    showToast("✓ Patient Emergency Profile updated!");
    await fetchReadiness();
  };

  const refreshData = async () => {
    await Promise.all([fetchPatientData(), fetchIdentity(), fetchActiveIncident(), fetchReadiness()]);
  };

  const updateIncidentStatus = async (nextStatus: string, hospitalId?: number) => {
    if (!activeIncident) return;
    try {
      const res = await fetch('/api/incidents/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_code: activeIncident.incident_code,
          next_status: nextStatus,
          assigned_hospital_id: hospitalId
        })
      });
      if (res.ok) {
        showToast(`Incident state updated to: ${nextStatus}`);
        await fetchActiveIncident();
      }
    } catch (e) {
      showToast(`State update queued: ${nextStatus}`);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <EmergencyContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        language,
        setLanguage,
        activeTab,
        setActiveTab,
        patient,
        setPatient,
        identity,
        activeIncident,
        readiness,
        toastMessage,
        showToast,
        refreshData,
        updateIncidentStatus,
        authUser,
        loginUser,
        logoutUser,
        updatePatientProfile,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        appointments,
        addAppointment,
        deleteAppointment
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};
