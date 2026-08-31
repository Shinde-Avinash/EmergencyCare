export type UserRole = 'PATIENT' | 'BYSTANDER' | 'PARAMEDIC' | 'HOSPITAL_STAFF' | 'ADMIN';

export type IncidentStatus = 
  | 'CREATED'
  | 'VERIFIED'
  | 'RESPONDER_ASSIGNED'
  | 'HOSPITAL_SELECTED'
  | 'HOSPITAL_NOTIFIED'
  | 'PATIENT_IN_TRANSIT'
  | 'HOSPITAL_RECEIVED'
  | 'CLOSED';

export type LanguageCode = 'en' | 'hi' | 'mr';

export interface PatientProfile {
  id: number;
  emergency_id: string;
  full_name: string;
  blood_group: string;
  dob: string;
  gender: string;
  primary_language: string;
  organ_donor: boolean;
  critical_allergies: string[];
  critical_conditions: string[];
  active_medications: string[];
  emergency_instructions: string;
  past_surgeries: string;
  recent_reports: string;
  ai_summary: string;
  ai_traceability: Array<{
    claim: string;
    source: string;
    confidence: number;
  }>;
}

export interface EmergencyIdentity {
  emergency_id: string;
  qr_break_glass_token: string;
  nfc_payload: string;
  printable_card_code: string;
  lockscreen_badge_url: string;
  is_active: boolean;
}

export interface Hospital {
  id: number;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  eta_minutes: number;
  trauma_capability: boolean;
  cardiac_capability: boolean;
  burn_unit: boolean;
  icu_beds_available: number;
  er_status: string;
  capability_match: boolean;
  match_score: number;
  capability_summary: string;
  is_recommended?: boolean;
  recommendation_reason?: string;
}

export interface Incident {
  id: number;
  incident_code: string;
  patient_id: number;
  status: IncidentStatus;
  current_lat: number;
  current_lng: number;
  eta_minutes: number;
  assigned_hospital: {
    id: number;
    name: string;
    phone: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLogItem {
  block_index: number;
  timestamp: string;
  user_name: string;
  user_role: string;
  access_type: string;
  access_reason: string;
  ip_address: string;
  previous_hash: string;
  current_hash: string;
}

export interface ReadinessScore {
  score: number;
  max_score: number;
  grade: string;
  checkpoints: Array<{
    item: string;
    passed: boolean;
    pts: number;
    impact?: string;
  }>;
  summary: string;
}

export interface CareCircleMember {
  id: number;
  name: string;
  relationship: string;
  phone: string;
  permission_tier: string;
  notify_on_break_glass: boolean;
}

export interface SuspiciousAlert {
  id: number;
  timestamp: string;
  user_name: string;
  role: string;
  access_count: number;
  risk_level: string;
  reason: string;
}

export interface MedicalDocumentItem {
  id: number;
  title: string;
  doc_type: string;
  confidence_score: number;
  upload_date: string;
  verification_status: string;
  preview: string;
}
