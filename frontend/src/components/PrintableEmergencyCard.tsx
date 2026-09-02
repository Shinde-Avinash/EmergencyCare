import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Phone, Heart, AlertTriangle, Printer } from 'lucide-react';

interface PrintableEmergencyCardProps {
  patient: any;
}

export const PrintableEmergencyCard: React.FC<PrintableEmergencyCardProps> = ({ patient }) => {
  const qrData = JSON.stringify({
    type: "EMERGENCY_ID",
    id: patient?.id || 1,
    name: patient?.full_name || "Rahul Sharma",
    bloodGroup: patient?.blood_group || "B+",
    allergies: patient?.critical_allergies || "Penicillin",
    icePhone: patient?.emergency_contact || "+91 98200 98200"
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h4 className="font-black text-sm text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Printable Physical Wallet Emergency ID Card</span>
          </h4>
          <p className="text-[11px] text-slate-600 font-medium">
            Standard ISO wallet format (85.6mm x 54mm). Keep in your wallet or phone case for emergency responders.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="bg-slate-900 hover:bg-slate-800 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-transform hover:scale-105"
        >
          <Printer className="w-4 h-4 text-emerald-400" />
          <span>Print Card 📇</span>
        </button>
      </div>

      {/* Wallet Card Container */}
      <div className="flex justify-center p-2">
        <div className="w-[340px] sm:w-[380px] bg-white border-2 border-slate-900 rounded-2xl shadow-xl overflow-hidden text-slate-900 relative print:w-[3.37inch] print:h-[2.12inch]">
          
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-slate-900 p-3 text-white flex justify-between items-center">
            <div className="flex items-center space-x-1.5">
              <span className="text-base">⚡</span>
              <div>
                <h5 className="font-black text-xs tracking-wide">EMERGENCY CARE ID</h5>
                <span className="text-[8px] font-mono text-rose-200 uppercase tracking-widest block">ZERO-DATA RESCUER ACCESS</span>
              </div>
            </div>

            <div className="bg-white text-rose-700 font-black text-xs px-2 py-0.5 rounded-md shadow-xs border border-rose-200">
              {patient?.blood_group || 'B+'}
            </div>
          </div>

          {/* Card Body */}
          <div className="p-3.5 space-y-2.5 bg-slate-50/60">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">PATIENT NAME</span>
                <h4 className="font-black text-sm text-slate-900 leading-tight">
                  {patient?.full_name || 'Rahul Sharma'}
                </h4>
                <span className="text-[10px] font-bold text-slate-600 block">
                  DOB: 14 May 1990 • ID #{patient?.id || 1}
                </span>
              </div>

              {/* Encrypted QR */}
              <div className="bg-white p-1.5 rounded-xl border border-slate-300 shadow-xs flex-shrink-0">
                <QRCodeSVG value={qrData} size={64} level="M" />
              </div>
            </div>

            {/* Critical Warnings Grid */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-rose-50 p-2 rounded-xl border border-rose-200">
                <span className="font-black text-rose-900 flex items-center space-x-1 mb-0.5">
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  <span>CRITICAL ALLERGY</span>
                </span>
                <p className="font-extrabold text-rose-950 truncate">
                  {patient?.critical_allergies || 'Penicillin'}
                </p>
              </div>

              <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                <span className="font-black text-emerald-900 flex items-center space-x-1 mb-0.5">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>ICE CONTACT</span>
                </span>
                <p className="font-extrabold text-emerald-950 truncate">
                  {patient?.emergency_contact || '+91 98200 98200'}
                </p>
              </div>
            </div>

            {/* Bottom Footer bar */}
            <div className="pt-1 border-t border-slate-200 flex justify-between items-center text-[8px] font-mono text-slate-500 font-bold">
              <span>SCAN QR IN EMERGENCY APP</span>
              <span>VERIFIED PATIENT CARD</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
