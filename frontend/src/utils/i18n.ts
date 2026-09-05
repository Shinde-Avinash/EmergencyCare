import { LanguageCode } from '../types';

export const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Nav & System
    app_title: "EmergencyCare",
    language_select: "Language",
    dashboard: "Patient Dashboard",
    scanner: "Break-Glass Scanner",
    qr_identity: "Emergency QR Card",
    medical_records: "Medical Records",
    audit_ledger: "Audit Ledger Engine",
    care_circle: "Care Circle Contacts",
    hospital_routing: "Hospital Dispatch Map",
    incident_tracker: "Incident Tracker",
    admin_panel: "Admin Patient Portal",
    profile: "User Profile",
    logout: "Sign Out",
    welcome: "Welcome Back",
    emergency_id: "Emergency ID",
    role: "User Role",
    patient: "Patient",
    bystander: "Bystander",
    paramedic: "Paramedic / First Responder",
    hospital_staff: "Hospital ER Doctor",
    admin: "System Administrator",

    // Auth & Login
    sign_in_gateway: "Sign In to Gateway",
    enter_credentials: "Enter credentials to access portal",
    email_address: "Email Address",
    password: "Password",
    sign_in_btn: "Sign In & Unlock Portal →",
    no_account: "Don't have an account?",
    register_link: "Register",
    forgot_password: "Forgot Password? Reset",
    authenticating: "Authenticating...",
    register_account: "Register Account",
    full_name: "Full Name",
    select_role: "Select Account Role",
    next_step: "Next Step →",
    previous_step: "← Back",
    complete_registration: "Complete Registration & Sign In",

    // Actions & Buttons
    scan_now: "Simulate QR Scan & Break-Glass",
    export_pdf: "Export Clinical PDF",
    add_to_wallet: "Add to Apple / Google Wallet",
    revoke_access: "Revoke Access Instantly",
    news2_calculator: "NEWS2 Triage Score",
    disaster_mode: "Mass Casualty Mode",
    show_gps: "Show My Real GPS",
    search_location: "Search Location",
    save_changes: "Save Changes",
    cancel: "Cancel",

    // Status & Banners
    session_active: "BREAK-GLASS EMERGENCY ACCESS AUTHORIZED",
    sos_sent: "Automated Care Circle SOS Broadcast Sent",
    ready_score: "Emergency Readiness Score",
    critical_allergies: "Critical Allergies",
    active_meds: "Active Daily Medications",
    blood_group: "Blood Group",
    resuscitation_instructions: "Emergency Instructions",

    // Subtitles
    privacy_notice: "Zero raw medical records stored on physical cards. Time-limited break-glass access.",
    handoff_console: "Real-time OpenStreetMap Leaflet ER Hospital Dispatch Console."
  },

  hi: {
    // Nav & System
    app_title: "इमरजेंसीकेयर",
    language_select: "भाषा",
    dashboard: "मरीज़ डैशबोर्ड",
    scanner: "ब्रेक-ग्लास स्कैनर",
    qr_identity: "आपातकालीन क्यूआर कार्ड",
    medical_records: "चिकित्सा रिकॉर्ड",
    audit_ledger: "ऑडिट लेजर इंजन",
    care_circle: "आपातकालीन संपर्क (केयर सर्कल)",
    hospital_routing: "अस्पताल डिस्पैच मैप",
    incident_tracker: "घटना ट्रैकर",
    admin_panel: "एडमिन पोर्टल",
    profile: "उपयोगकर्ता प्रोफ़ाइल",
    logout: "साइन आउट",
    welcome: "पुनः स्वागत है",
    emergency_id: "इमरजेंसी आईडी",
    role: "उपयोगकर्ता भूमिका",
    patient: "मरीज़",
    bystander: "प्रत्यक्षदर्शी (बाइस्टैंडर)",
    paramedic: "पैरामेडिक / प्रथम प्रतिक्रियाकर्ता",
    hospital_staff: "अस्पताल ईआर डॉक्टर",
    admin: "सिस्टम एडमिनिस्ट्रेटर",

    // Auth & Login
    sign_in_gateway: "गेटवे में साइन इन करें",
    enter_credentials: "पोर्टल तक पहुंचने के लिए विवरण दर्ज करें",
    email_address: "ईमेल पता",
    password: "पासवर्ड",
    sign_in_btn: "साइन इन करें और पोर्टल खोलें →",
    no_account: "खाता नहीं है?",
    register_link: "पंजीकरण करें",
    forgot_password: "पासवर्ड भूल गए? रीसेट करें",
    authenticating: "प्रमाणित किया जा रहा है...",
    register_account: "खाता पंजीकृत करें",
    full_name: "पूरा नाम",
    select_role: "खाता भूमिका चुनें",
    next_step: "अगला चरण →",
    previous_step: "← पीछे",
    complete_registration: "पंजीकरण पूरा करें और साइन इन करें",

    // Actions & Buttons
    scan_now: "क्यूआर स्कैन और ब्रेक-ग्लास शुरू करें",
    export_pdf: "क्लीनिकल पीडीएफ निर्यात करें",
    add_to_wallet: "एप्पल / गूगल वॉलेट में जोड़ें",
    revoke_access: "तुरंत पहुंच रद्द करें",
    news2_calculator: "NEWS2 ट्राइएज स्कोर",
    disaster_mode: "सामूहिक हताहत (आपदा) मोड",
    show_gps: "मेरा वास्तविक जीपीएस दिखाएं",
    search_location: "स्थान खोजें",
    save_changes: "परिवर्तन सहेजें",
    cancel: "रद्द करें",

    // Status & Banners
    session_active: "ब्रेक-ग्लास आपातकालीन पहुंच अधिकृत",
    sos_sent: "केयर सर्कल स्वचालित एसओएस अलर्ट भेजा गया",
    ready_score: "आपातकालीन तैयारी स्कोर",
    critical_allergies: "गंभीर एलर्जी",
    active_meds: "सक्रिय दवाएं",
    blood_group: "रक्त समूह",
    resuscitation_instructions: "आपातकालीन निर्देश",

    // Subtitles
    privacy_notice: "भौतिक कार्डों पर कोई कच्चा मेडिकल डेटा नहीं। समय-सीमित ब्रेक-ग्लास पहुंच।",
    handoff_console: "रियल-टाइम ओपनस्ट्रीटमैप लीफलेट ईआर अस्पताल डिस्पैच कंसोल।"
  },

  mr: {
    // Nav & System
    app_title: "इमर्जन्सीकेअर",
    language_select: "भाषा",
    dashboard: "रुग्ण डॅशबोर्ड",
    scanner: "ब्रेक-ग्लास स्कॅनर",
    qr_identity: "आपत्कालीन क्यूआर कार्ड",
    medical_records: "वैद्यकीय नोंदी",
    audit_ledger: "ऑडिट लेजर इंजिन",
    care_circle: "आपत्कालीन संपर्क (केअर सर्कल)",
    hospital_routing: "रुग्णालय नकाशे व मार्ग",
    incident_tracker: "घटना ट्रॅकर",
    admin_panel: "अ‍ॅडमिन पोर्टल",
    profile: "वापरकर्ता प्रोफाइल",
    logout: "बाहेर पडा (साइन आउट)",
    welcome: "पुन्हा स्वागत आहे",
    emergency_id: "आपत्कालीन आयडी",
    role: "वापरकर्ता भूमिका",
    patient: "रुग्ण",
    bystander: "प्रत्यक्षदर्शी (बायस्टँडर)",
    paramedic: "पॅरामेडिक / प्रथम प्रतिसादक",
    hospital_staff: "रुग्णालय ईआर डॉक्टर",
    admin: "सिस्टम अ‍ॅडमिनिस्ट्रेटर",

    // Auth & Login
    sign_in_gateway: "गेटवेमध्ये साइन इन करा",
    enter_credentials: "पोर्टल प्रवेशासाठी माहिती प्रविष्ट करा",
    email_address: "ईमेल पत्ता",
    password: "पासवर्ड",
    sign_in_btn: "साइन इन करा आणि पोर्टल उघडा →",
    no_account: "खाते नाही का?",
    register_link: "नोंदणी करा",
    forgot_password: "पासवर्ड विसरलात? रिसेट करा",
    authenticating: "प्रमाणित करत आहे...",
    register_account: "खाते नोंदवा",
    full_name: "पूर्ण नाव",
    select_role: "खाते भूमिका निवडा",
    next_step: "पुढील पायरी →",
    previous_step: "← मागे",
    complete_registration: "नोंदणी पूर्ण करा आणि साइन इन करा",

    // Actions & Buttons
    scan_now: "क्यूआर स्कॅन आणि ब्रेक-ग्लास सुरू करा",
    export_pdf: "क्लिनिकल पीडीएफ निर्यात करा",
    add_to_wallet: "अ‍ॅपल / गूगल वॉलेटमध्ये जोडा",
    revoke_access: "प्रवेश त्वरित रद्द करा",
    news2_calculator: "NEWS2 ट्रियाज स्कोर",
    disaster_mode: "आपत्ती (मास कॅज्युअल्टी) मोड",
    show_gps: "माझे रिअल जीपीएस दाखवा",
    search_location: "ठिकाण शोधा",
    save_changes: "बदल जतन करा",
    cancel: "रद्द करा",

    // Status & Banners
    session_active: "ब्रेक-ग्लास आपत्कालीन प्रवेश मंजूर",
    sos_sent: "केअर सर्कल स्वयंचलित एसओएस सूचना पाठवली",
    ready_score: "आपत्कालीन सज्जता स्कोर",
    critical_allergies: "गंभीर अ‍ॅलर्जी",
    active_meds: "सध्या सुरू असलेली औषधे",
    blood_group: "रक्तगट",
    resuscitation_instructions: "आपत्कालीन सूचना",

    // Subtitles
    privacy_notice: "कार्डवर कोणताही कच्चा वैद्यकीय डेटा साठवला जात नाही. वेळेनुसार मर्यादित ब्रेक-ग्लास प्रवेश.",
    handoff_console: "रिअल-टाइम ओपनस्ट्रीटमॅप लीफलेट ईआर रुग्णालय डिस्पैच कंसोल."
  }
};

export const getTranslation = (key: string, lang: LanguageCode = 'en'): string => {
  if (translations[lang] && translations[lang][key]) {
    return translations[lang][key];
  }
  if (translations.en && translations.en[key]) {
    return translations.en[key];
  }
  return key;
};
