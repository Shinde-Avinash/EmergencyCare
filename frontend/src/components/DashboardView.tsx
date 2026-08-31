import React, { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MoreVertical, 
  Pill, 
  ShieldAlert, 
  Activity, 
  Scan, 
  AlertTriangle, 
  X, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Trash2,
  Stethoscope
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    patient, 
    setActiveTab, 
    readiness, 
    appointments, 
    addAppointment, 
    deleteAppointment 
  } = useEmergency();

  const [activeMetric, setActiveMetric] = useState<'vitals' | 'bp' | 'pulse'>('vitals');

  // Dynamic Calendar Month Navigation State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal State for New Appointment Booking
  const [showAppModal, setShowAppModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState('Dr. Anaya Deshmukh');
  const [newSpecialty, setNewSpecialty] = useState('Emergency ER Specialist');
  const [newSlot, setNewSlot] = useState('03:00 PM – 03:40 PM');
  const [newTheme, setNewTheme] = useState('#e8f4f0');

  // Dynamic Calendar Month Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const todayDateNum = new Date().getDate();
  const isCurrentMonth = new Date().getMonth() === month && new Date().getFullYear() === year;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Build Calendar Matrix (Mon-Sun layout)
  const calendarDays = [];
  const startOffset = (firstDayIndex === 0 ? 6 : firstDayIndex - 1); // Align Mon=0

  for (let i = 0; i < startOffset; i++) {
    calendarDays.push({ day: '', isOffset: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({ day: d, isOffset: false });
  }

  // Handle Form Submit for New Appointment
  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctor || !newSpecialty) return;

    addAppointment({
      specialty: newSpecialty,
      doctor_name: newDoctor,
      time_slot: newSlot,
      date_str: 'Scheduled',
      icon_emoji: newSpecialty.includes('Emergency') ? '🚨' : '👨‍⚕️',
      bg_color: newTheme
    });

    setShowAppModal(false);
  };

  // Dynamic Chart Configurations
  const chartConfigs = {
    vitals: {
      title1: "Emergency Readiness (85%)",
      title2: "Vitals Stability (92%)",
      color1: "#3b82f6",
      color2: "#22c55e",
      path1: "M 0 110 Q 75 40 150 75 T 300 120 T 420 80 T 500 110",
      path2: "M 0 150 Q 75 110 150 60 T 300 65 T 420 25 T 500 50",
      yLabels: ["100%", "85%", "70%", "55%"],
      badge: "OPTIMAL READINESS"
    },
    bp: {
      title1: "Systolic BP (120 mmHg)",
      title2: "Diastolic BP (80 mmHg)",
      color1: "#ef4444",
      color2: "#3b82f6",
      path1: "M 0 50 Q 75 80 150 40 T 300 55 T 420 45 T 500 50",
      path2: "M 0 130 Q 75 140 150 125 T 300 135 T 420 120 T 500 128",
      yLabels: ["140", "120", "100", "80"],
      badge: "NORMAL BLOOD PRESSURE"
    },
    pulse: {
      title1: "Heart Rate (72 bpm)",
      title2: "Oxygen SpO2 (98%)",
      color1: "#ec4899",
      color2: "#06b6d4",
      path1: "M 0 90 Q 75 130 150 80 T 300 70 T 420 100 T 500 85",
      path2: "M 0 30 Q 75 25 150 35 T 300 20 T 420 30 T 500 25",
      yLabels: ["100", "85", "70", "55"],
      badge: "STABLE CARDIAC PULSE"
    }
  };

  const currentChart = chartConfigs[activeMetric];

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-6">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-600 font-medium">Welcome back, {patient?.full_name || 'Rahul Sharma'}</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search record, doctor, hospital..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-400 shadow-sm"
          />
        </div>
      </div>

      {/* Main 4-Widget Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* 1. TOP LEFT: Dynamic "My parameters" Chart Widget (8 Cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-slate-900">My parameters</h2>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  {currentChart.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Track key emergency readiness & health metrics over time</p>
            </div>

            {/* Metric Switcher Tabs */}
            <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-full">
              <button
                onClick={() => setActiveMetric('vitals')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  activeMetric === 'vitals' ? 'bg-slate-900 text-white shadow-sm font-black' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Readiness • Vitals
              </button>
              <button
                onClick={() => setActiveMetric('bp')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  activeMetric === 'bp' ? 'bg-slate-900 text-white shadow-sm font-black' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Blood Pressure
              </button>
              <button
                onClick={() => setActiveMetric('pulse')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  activeMetric === 'pulse' ? 'bg-slate-900 text-white shadow-sm font-black' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Pulse
              </button>
            </div>
          </div>

          {/* Dynamic SVG Curve Chart */}
          <div className="w-full h-48 relative pt-2">
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] font-bold text-slate-400">
              <span>{currentChart.yLabels[0]}</span>
              <span>{currentChart.yLabels[1]}</span>
              <span>{currentChart.yLabels[2]}</span>
              <span>{currentChart.yLabels[3]}</span>
            </div>

            <svg className="w-full h-full overflow-visible pl-8" viewBox="0 0 500 150" preserveAspectRatio="none">
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeWidth="1" />

              <path
                d={currentChart.path1}
                fill="none"
                stroke={currentChart.color1}
                strokeWidth="3.5"
                strokeLinecap="round"
                className="transition-all duration-500"
              />

              <path
                d={currentChart.path2}
                fill="none"
                stroke={currentChart.color2}
                strokeWidth="3.5"
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>

            <div className="flex justify-between text-[11px] font-bold text-slate-400 pt-1 pl-8">
              <span>May</span>
              <span>June</span>
              <span>July</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs font-bold pt-1 border-t border-slate-100">
            <span className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: currentChart.color1 }} />
              <span className="text-slate-800">{currentChart.title1}</span>
            </span>
            <span className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: currentChart.color2 }} />
              <span className="text-slate-800">{currentChart.title2}</span>
            </span>
          </div>

        </div>

        {/* 2. TOP RIGHT: Dynamic Real Calendar Widget (4 Cols) */}
        <div className="lg:col-span-4 bg-[#eaf3f0] p-5 rounded-3xl border border-[#d3e4e0]/80 shadow-sm space-y-3">
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Calendar Year {year}</span>
              <h3 className="text-lg font-black text-slate-900">{monthName}, {isCurrentMonth ? todayDateNum : 1}</h3>
            </div>

            {/* Interactive Month Switcher */}
            <div className="flex items-center space-x-1.5">
              <button 
                onClick={prevMonth}
                title="Previous Month"
                className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center shadow-sm transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={nextMonth}
                title="Next Month"
                className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center shadow-sm transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dynamic Month Matrix Grid */}
          <div className="space-y-1.5 text-center text-xs">
            <div className="grid grid-cols-7 font-extrabold text-slate-400 text-[10px]">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>

            <div className="grid grid-cols-7 font-bold text-slate-700 gap-y-1.5 items-center">
              {calendarDays.map((item, index) => {
                if (item.isOffset) {
                  return <span key={index} className="text-slate-300">-</span>;
                }

                const isToday = isCurrentMonth && item.day === todayDateNum;

                return (
                  <span
                    key={index}
                    className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto transition-all ${
                      isToday 
                        ? 'bg-slate-900 text-white font-black shadow-sm ring-2 ring-emerald-400' 
                        : 'hover:bg-white text-slate-800'
                    }`}
                  >
                    {item.day}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 space-y-0.5 text-xs">
            <span className="font-black text-rose-700 uppercase tracking-wider text-[9px] block">STANDBY DISPATCH STATUS</span>
            <p className="font-extrabold text-slate-900">Level-1 ER Trauma Standby Active</p>
          </div>

        </div>

        {/* 3. BOTTOM LEFT: Dynamic "My appointments" Widget (8 Cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">My appointments</h3>
              <p className="text-xs text-slate-500 font-medium">Scheduled visits and emergency consultations ({appointments.length})</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAppModal(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-full text-xs font-black flex items-center space-x-1 shadow-sm transition-transform hover:scale-[1.02]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book Appointment</span>
              </button>
            </div>
          </div>

          {/* Render Dynamic Appointments List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {appointments.map((app) => (
              <div 
                key={app.id} 
                style={{ backgroundColor: app.bg_color || '#e8f4f0' }}
                className="p-3.5 rounded-2xl flex items-center justify-between border border-slate-200/60 shadow-xs relative group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-white text-slate-900 font-black flex items-center justify-center text-base shadow-sm border border-slate-200">
                    {app.icon_emoji}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-xs">{app.specialty}</h4>
                    <span className="text-[11px] font-bold text-slate-700 block">{app.time_slot}</span>
                    <span className="text-[10px] font-bold text-slate-500">{app.doctor_name} • {app.date_str}</span>
                  </div>
                </div>

                <button
                  onClick={() => deleteAppointment(app.id)}
                  title="Cancel Appointment"
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Initiate Break-Glass Action */}
          <button
            onClick={() => setActiveTab('scanner')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3 rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-sm transition-transform hover:scale-[1.005]"
          >
            <Scan className="w-4 h-4 text-white" />
            <span>🚨 Initiate Break-Glass Emergency Access</span>
          </button>

        </div>

        {/* 4. BOTTOM RIGHT: "My treatment" Widget (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          
          <div>
            <h3 className="text-lg font-black text-slate-900">My treatment</h3>
            <p className="text-xs text-slate-500 font-medium">Current medications and daily intake</p>
          </div>

          <div className="space-y-2.5 text-xs">
            
            <div className="bg-[#edf3fe] p-3 rounded-2xl flex items-center space-x-3 border border-[#d3e9fe]/60">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                <Pill className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-xs">Ibuprofen</h4>
                <span className="text-[11px] font-bold text-slate-600">2 times per day</span>
              </div>
            </div>

            <div className="bg-[#e8f4f0] p-3 rounded-2xl flex items-center space-x-3 border border-[#d3e4e0]/60">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                <Pill className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-xs">Vitamin B12</h4>
                <span className="text-[11px] font-bold text-slate-600">1 time per day</span>
              </div>
            </div>

            <div className="bg-[#fef9e6] p-3 rounded-2xl flex items-center space-x-3 border border-[#fceea4]/60">
              <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-black text-amber-950 text-xs">Penicillin (ALLERGY)</h4>
                <span className="text-[11px] font-black text-rose-700">STRICT CONTRAINDICATION</span>
              </div>
            </div>

          </div>

          <button
            onClick={() => setActiveTab('profile')}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold py-2.5 rounded-2xl text-xs flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Medication / Allergy</span>
          </button>

        </div>

      </div>

      {/* BOOK NEW APPOINTMENT MODAL DIALOG */}
      {showAppModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Book New Appointment</h3>
              </div>

              <button
                onClick={() => setShowAppModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-900 font-bold mb-1">Doctor Specialty</label>
                <select
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none"
                >
                  <option value="Cardiologist">Cardiologist (Heart Specialist)</option>
                  <option value="Emergency ER Specialist">Emergency ER Specialist</option>
                  <option value="Pulmonologist">Pulmonologist (Asthma Care)</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="General Physician">General Physician</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1">Doctor Name</label>
                <input
                  type="text"
                  value={newDoctor}
                  onChange={(e) => setNewDoctor(e.target.value)}
                  required
                  placeholder="e.g. Dr. Richard Michels"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1">Time Slot</label>
                <input
                  type="text"
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  required
                  placeholder="e.g. 02.00 PM - 02.40 PM"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1">Card Theme Style</label>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setNewTheme('#e8f4f0')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      newTheme === '#e8f4f0' ? 'border-emerald-600 bg-[#e8f4f0] text-emerald-950 font-black' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    Mint Green
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTheme('#edf3fe')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      newTheme === '#edf3fe' ? 'border-blue-600 bg-[#edf3fe] text-blue-950 font-black' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    Pastel Blue
                  </button>
                </div>
              </div>

              <div className="flex space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAppModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold py-3 rounded-2xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white font-black py-3 rounded-2xl shadow-sm text-xs uppercase tracking-wider"
                >
                  Confirm Appointment Booking
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
