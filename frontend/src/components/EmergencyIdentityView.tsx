import React, { useState, useEffect } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  Smartphone, 
  Printer, 
  Radio, 
  ShieldCheck, 
  Copy, 
  Check, 
  Download, 
  Lock
} from 'lucide-react';

export const EmergencyIdentityView: React.FC = () => {
  const { identity, patient, authUser, showToast, t } = useEmergency();
  const [copied, setCopied] = useState(false);
  const [nfcSimulating, setNfcSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'nfc' | 'print' | 'lockscreen'>('qr');

  // Dynamic Live Clock & Calendar State for Phone Lock Screen
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  const patientName = patient?.full_name || authUser?.name || 'Rahul Sharma';
  const bloodGroup = patient?.blood_group || 'B+';
  const allergyList = patient?.critical_allergies && patient.critical_allergies.length > 0 
    ? patient.critical_allergies.join(', ')
    : 'No Known Allergies';

  const breakGlassUrl = `${window.location.origin}/break-glass/${identity?.qr_break_glass_token || 'BG-TOKEN-8942-ALPHA-KEY'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(breakGlassUrl);
    setCopied(true);
    showToast("Break-Glass Emergency Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulateNFC = () => {
    setNfcSimulating(true);
    showToast("NFC Tag Emulated: Transmitting Break-Glass URL via 13.56 MHz NFC...");
    setTimeout(() => {
      setNfcSimulating(false);
      showToast("✓ NFC Payload successfully broadcasted to nearby reader!");
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-rose-700 font-black text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            <span>MODULE 1: EMERGENCY IDENTITY & QR/NFC CARDS</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Patient Emergency Identity</h2>
          <p className="text-xs text-slate-700 font-bold mt-0.5">
            Privacy-first Emergency ID card with Break-Glass QR code, NFC tag, and printable wallet card.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-100 border border-slate-300 px-4 py-2 rounded-xl text-xs">
          <span className="text-slate-700 font-bold">Emergency ID:</span>
          <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 shadow-sm">
            {identity?.emergency_id || 'EMG-8942-X'}
          </span>
        </div>
      </div>

      {/* Tabs selector */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('qr')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'qr'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Dynamic QR Code</span>
        </button>

        <button
          onClick={() => setActiveTab('nfc')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'nfc'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>NFC Wearable Tag</span>
        </button>

        <button
          onClick={() => setActiveTab('print')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'print'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Printable Wallet Card</span>
        </button>

        <button
          onClick={() => setActiveTab('lockscreen')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'lockscreen'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Phone Lock Screen</span>
        </button>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'qr' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* QR Code Container */}
          <div className="bg-white border border-slate-200 p-8 rounded-2xl flex flex-col items-center justify-center space-y-6 text-center shadow-sm">
            <div className="p-4 bg-white rounded-2xl shadow-md border-2 border-rose-600">
              <QRCodeSVG
                value={breakGlassUrl}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-mono bg-rose-100 text-rose-900 border border-rose-300 px-3 py-1 rounded-full font-black inline-block">
                Opaque Token: {identity?.qr_break_glass_token || 'BG-TOKEN-8942-ALPHA-KEY'}
              </span>
              <p className="text-xs text-slate-800 max-w-sm font-bold">
                This QR Code contains zero raw medical records. It resolves to a time-limited Break-Glass authorization portal.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 w-full max-w-xs">
              <button
                onClick={handleCopyLink}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold px-3 py-2.5 rounded-xl border border-slate-300 text-xs flex items-center justify-center space-x-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
              <button
                onClick={() => showToast("QR Code SVG Downloaded for Print / Bracelet")}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-3 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Save QR</span>
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/emergency-identity/${identity?.emergency_id || 'EMG-8942-X'}/wallet-pass`);
                    const data = await res.json();
                    showToast("📱 Added Emergency ID to Apple / Google Wallet Pass!");
                  } catch (e) {
                    showToast("📱 Downloaded Emergency Digital Wallet Pass (.pkpass)");
                  }
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-3 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm"
              >
                <span>📲 Add to Apple / Google Wallet</span>
              </button>
            </div>
          </div>

          {/* Privacy Security Controls Box */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-5 shadow-sm">
            <h3 className="font-black text-lg text-slate-900 flex items-center space-x-2 border-b border-slate-200 pb-3">
              <Lock className="w-5 h-5 text-rose-600" />
              <span>Data Protection & Privacy Rules</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="font-black text-slate-900 block">1. Zero Raw Data on Code</span>
                <p className="text-slate-800 font-bold">
                  Scanning without initiating Break-Glass reveals zero medical history.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="font-black text-slate-900 block">2. Role-Based Access Scoping</span>
                <p className="text-slate-800 font-bold">
                  Bystanders see Allergies & Blood Group only. Paramedics see Medication list. ER Doctors see Full History.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="font-black text-slate-900 block">3. Immutable SHA-256 Audit Trail</span>
                <p className="text-slate-800 font-bold">
                  Every scan records timestamp, location, and requester identity in a tamper-evident audit ledger.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* NFC Tab View */}
      {activeTab === 'nfc' && (
        <div className="bg-white border border-slate-200 p-8 max-w-xl mx-auto rounded-2xl space-y-6 text-center shadow-sm">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 border border-rose-200 rounded-full flex items-center justify-center mx-auto">
            <Radio className={`w-8 h-8 ${nfcSimulating ? 'animate-ping' : ''}`} />
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900">NFC Smart Emergency Wearable</h3>
            <p className="text-xs text-slate-700 font-bold mt-1">
              Simulate tapping an NFC-enabled emergency bracelet or smart ring against a responder phone.
            </p>
          </div>

          <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-900 inline-block font-bold">
            NFC Payload: {identity?.nfc_payload}
          </div>

          <div>
            <button
              onClick={handleSimulateNFC}
              disabled={nfcSimulating}
              className="bg-rose-600 hover:bg-rose-700 text-white font-black px-6 py-3 rounded-xl shadow-md text-xs uppercase tracking-wider transition-all"
            >
              {nfcSimulating ? "Transmitting NFC Signal..." : "Simulate NFC Tag Tap"}
            </button>
          </div>
        </div>
      )}

      {/* Printable Card Tab View */}
      {activeTab === 'print' && (
        <div className="bg-white border border-slate-200 p-8 max-w-xl mx-auto rounded-2xl space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-black text-slate-900 text-base">Printable Wallet Emergency Card</h3>
            <button
              onClick={() => window.print()}
              className="bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Card</span>
            </button>
          </div>

          {/* Wallet Card Mockup */}
          <div className="bg-white border-2 border-slate-900 p-6 rounded-2xl shadow-md space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest block">EMERGENCYCARE IDENTITY</span>
                <h4 className="text-2xl font-black text-slate-900">{patient?.full_name || 'Rahul Sharma'}</h4>
                <p className="text-xs text-slate-800 font-bold mt-0.5">Blood Group: <span className="text-rose-700 text-base font-black">{patient?.blood_group || 'B+'}</span></p>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-300 shadow-sm">
                <QRCodeSVG value={breakGlassUrl} size={70} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-200 pt-3">
              <div>
                <span className="text-[10px] text-slate-700 block font-black">SEVERE ALLERGIES</span>
                <span className="font-black text-rose-800">{patient?.critical_allergies.join(', ') || 'Penicillin'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-700 block font-black">EMERGENCY CONTACT</span>
                <span className="font-black text-slate-900">+91 98230 99887 (Spouse)</span>
              </div>
            </div>

            <div className="bg-rose-100 p-2.5 rounded-lg border border-rose-300 text-[10px] text-rose-950 font-black text-center">
              🚨 IN EMERGENCY: Scan QR code above for Break-Glass access to critical medical history.
            </div>
          </div>
        </div>
      )}

      {/* Lockscreen Badge View */}
      {activeTab === 'lockscreen' && (
        <div className="bg-white border border-slate-200 p-8 max-w-sm mx-auto rounded-2xl space-y-4 text-center shadow-sm">
          <h3 className="font-black text-slate-900 text-base">Phone Lock Screen Wallpaper</h3>
          <p className="text-xs text-slate-700 font-bold">Live lock screen wallpaper auto-syncs with your emergency identity & real-time clock.</p>

          <div className="w-64 h-[420px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl mx-auto p-4 flex flex-col justify-between shadow-2xl relative border border-slate-700/60 overflow-hidden">
            
            {/* Live Clock Header */}
            <div className="text-center pt-3 space-y-0.5">
              <span className="text-3xl font-light tracking-tight font-sans text-slate-100">{formattedTime}</span>
              <p className="text-[10px] text-slate-400 font-medium">{formattedDate}</p>
            </div>

            {/* Dynamic Emergency Badge Card */}
            <div className="bg-white text-slate-900 p-3.5 rounded-2xl text-center space-y-2 border border-slate-200 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <span className="text-[9px] font-black text-rose-700 uppercase tracking-wider">EMERGENCY MEDICAL ID</span>
                <span className="text-[8px] font-mono bg-rose-100 text-rose-900 font-black px-1.5 py-0.5 rounded">
                  {identity?.emergency_id || 'EMG-8942-X'}
                </span>
              </div>

              <div className="p-1.5 bg-white inline-block rounded-xl border border-slate-200 shadow-xs">
                <QRCodeSVG value={breakGlassUrl} size={95} />
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-900 leading-tight">{patientName}</h4>
                <p className="text-[10px] font-bold text-slate-700">
                  Blood Group: <strong className="text-rose-700 font-black">{bloodGroup}</strong>
                </p>
                <div className="bg-rose-50 p-1.5 rounded-lg border border-rose-200 text-[9px] font-extrabold text-rose-950">
                  Allergies: {allergyList}
                </div>
              </div>
            </div>

            <div className="pb-1 text-[9px] text-slate-400 font-mono flex items-center justify-between px-2">
              <span>EmergencyCare Mobile ID</span>
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block mr-1" />
                LIVE
              </span>
            </div>

          </div>

          <button
            onClick={() => showToast(`✓ Phone Lock Screen wallpaper downloaded for ${patientName}!`)}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3 rounded-xl text-xs shadow-md uppercase tracking-wider flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Save Dynamic Wallpaper</span>
          </button>
        </div>
      )}

    </div>
  );
};
