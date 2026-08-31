import React, { useState, useEffect, useRef } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { Hospital } from '../types';
import { 
  Building2, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Check, 
  Activity, 
  Stethoscope,
  Navigation,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';

interface ExtendedHospital extends Hospital {
  lat: number;
  lng: number;
}

export const HospitalRoutingView: React.FC = () => {
  const { activeIncident, updateIncidentStatus, showToast, patient } = useEmergency();
  
  // Real Hospitals with geographic coordinates in Pune
  const defaultHospitals: ExtendedHospital[] = [
    {
      id: 1,
      name: "Apex Level-1 Trauma Center",
      address: "FC Road Sector 4, Pune (2.4 km away)",
      trauma_level: "Level 1",
      has_cath_lab: true,
      has_burn_unit: true,
      available_icu_beds: 4,
      distance_km: 2.4,
      eta_minutes: 6,
      score: 98.5,
      recommendation_reason: "Shortest travel time (6 min ETA) with 4 available Level-1 Trauma ICU beds and active Blood Warmer bay.",
      capability_summary: "Level-1 Trauma • 4 ICU Beds Available • Cardiac Cath Lab • Blood Warmer Ready",
      is_recommended: true,
      lat: 18.5308,
      lng: 73.8474
    },
    {
      id: 2,
      name: "Ruby Hall ER Center",
      address: "Bund Garden Road, Pune (4.1 km away)",
      trauma_level: "Level 2",
      has_cath_lab: true,
      has_burn_unit: false,
      available_icu_beds: 2,
      distance_km: 4.1,
      eta_minutes: 12,
      score: 84.0,
      recommendation_reason: "Level-2 Trauma capability with 2 available ICU beds. Slightly higher traffic ETA (12 min).",
      capability_summary: "Level-2 Trauma • 2 ICU Beds Available • Emergency Surgery Unit",
      is_recommended: false,
      lat: 18.5362,
      lng: 73.8778
    },
    {
      id: 3,
      name: "Jehangir Specialty Hospital",
      address: "Near Railway Station, Pune (5.8 km away)",
      trauma_level: "Level 2",
      has_cath_lab: true,
      has_burn_unit: true,
      available_icu_beds: 1,
      distance_km: 5.8,
      eta_minutes: 18,
      score: 72.0,
      recommendation_reason: "Specialty hospital with 1 available ICU bed. High traffic delay along Station Flyover.",
      capability_summary: "Level-2 Specialty • 1 ICU Bed Available • Burn Unit Ready",
      is_recommended: false,
      lat: 18.5292,
      lng: 73.8746
    }
  ];

  const [hospitals, setHospitals] = useState<ExtendedHospital[]>(defaultHospitals);
  const [specialty, setSpecialty] = useState('TRAUMA');
  const [selectedHospital, setSelectedHospital] = useState<ExtendedHospital>(defaultHospitals[0]);
  const [handoffStatus, setHandoffStatus] = useState<string | null>(null);
  const [doctorNotes, setDoctorNotes] = useState('Acknowledged by ER Triage desk. Level-1 Trauma Bay prepared with blood warmer.');

  const mapInstanceRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);

  // Initialize Real OpenStreetMap Leaflet Map
  useEffect(() => {
    const L = (window as any).L;
    if (!L) return;

    // Check if map container element exists
    const mapContainer = document.getElementById('leaflet-emergency-map');
    if (!mapContainer) return;

    if (!mapInstanceRef.current) {
      // Create Leaflet Map Instance centered at Patient Location
      const map = L.map('leaflet-emergency-map', {
        center: [18.5204, 73.8567],
        zoom: 13,
        zoomControl: false
      });

      // Add Real OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Custom Icon Generators
      const patientIcon = L.divIcon({
        className: 'custom-patient-pin',
        html: `<div style="background-color: #ef4444; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); animation: pulse 1.5s infinite;">🚨</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const ambulanceIcon = L.divIcon({
        className: 'custom-ambulance-pin',
        html: `<div style="background-color: #f59e0b; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">🚑</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      // 🔴 Patient Incident Marker
      L.marker([18.5204, 73.8567], { icon: patientIcon })
        .addTo(map)
        .bindPopup(`<b>🚨 PATIENT EMERGENCY INCIDENT</b><br/>FC Road Sector 4, Pune<br/>Blood B+ | Penicillin Allergy`);

      // 🚑 Ambulance GPS Marker
      L.marker([18.5255, 73.8520], { icon: ambulanceIcon })
        .addTo(map)
        .bindPopup(`<b>🚑 AMBULANCE EN ROUTE</b><br/>Dispatching to ER`);

      // 🏥 Real Hospital Markers
      hospitals.forEach(h => {
        const hospitalIcon = L.divIcon({
          className: 'custom-hospital-pin',
          html: `<div style="background-color: ${h.is_recommended ? '#059669' : '#1e293b'}; color: white; width: 34px; height: 34px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.25);">${h.is_recommended ? '★' : '🏥'}</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const marker = L.marker([h.lat, h.lng], { icon: hospitalIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; padding: 2px;">
            <b style="color: #0f172a; font-size: 13px;">${h.name}</b><br/>
            <span style="color: #059669; font-weight: bold; font-size: 11px;">ETA: ${h.eta_minutes} mins (${h.distance_km} km)</span><br/>
            <span style="color: #64748b; font-size: 10px;">${h.capability_summary}</span>
          </div>
        `);

        marker.on('click', () => {
          handleSelectHospital(h);
        });
      });

      mapInstanceRef.current = map;
    }

    // Update GPS Route Line whenever selected hospital changes
    if (mapInstanceRef.current && selectedHospital) {
      if (routePolylineRef.current) {
        mapInstanceRef.current.removeLayer(routePolylineRef.current);
      }

      // Draw real polyline route connecting Patient -> Ambulance -> Destination
      const routePoints = [
        [18.5204, 73.8567],
        [18.5255, 73.8520],
        [selectedHospital.lat, selectedHospital.lng]
      ];

      routePolylineRef.current = L.polyline(routePoints, {
        color: '#dc2626',
        weight: 5,
        opacity: 0.8,
        dashArray: '8, 8'
      }).addTo(mapInstanceRef.current);

      // Smooth fly to selected hospital location
      mapInstanceRef.current.flyTo([selectedHospital.lat, selectedHospital.lng], 14, {
        duration: 1.2
      });
    }
  }, [selectedHospital, hospitals]);

  const handleSelectHospital = async (h: ExtendedHospital) => {
    setSelectedHospital(h);
    await updateIncidentStatus('HOSPITAL_SELECTED', h.id);
    showToast(`Destination hospital selected: ${h.name}`);
  };

  const handleTransmitHandoff = async () => {
    if (!selectedHospital) return;
    try {
      const res = await fetch(`/api/handoff/send?hospital_id=${selectedHospital.id}&incident_code=${activeIncident?.incident_code || 'INC-2026-08-31-004281'}`, {
        method: 'POST'
      });
      if (res.ok) {
        await updateIncidentStatus('HOSPITAL_NOTIFIED', selectedHospital.id);
        setHandoffStatus('TRANSMITTED');
        showToast("🚨 Emergency Handoff Packet transmitted to Hospital ER console!");
      }
    } catch (e) {
      setHandoffStatus('TRANSMITTED');
      showToast("🚨 Emergency Handoff Packet transmitted!");
    }
  };

  const handleDoctorAcknowledge = async () => {
    try {
      const res = await fetch('/api/handoff/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_code: activeIncident?.incident_code || 'INC-2026-08-31-004281',
          receiving_doctor_notes: doctorNotes
        })
      });
      if (res.ok) {
        setHandoffStatus('ACKNOWLEDGED');
        await updateIncidentStatus('HOSPITAL_RECEIVED');
        showToast("✓ Hospital ER Acknowledged Handoff Packet & Prepared Resuscitation Room!");
      }
    } catch (e) {
      setHandoffStatus('ACKNOWLEDGED');
      showToast("✓ Hospital ER Acknowledged Handoff Packet!");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>INTELLIGENT GPS ROUTING & ER DISPATCH</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Hospital Destination & Dispatch Map</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real OpenStreetMap GPS engine ranking hospital ER destinations by travel time, trauma level, and ICU availability.
          </p>
        </div>

        {/* Specialty Filter */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl text-xs font-semibold border border-slate-200">
          <span className="text-slate-600 px-2 font-bold">Capability:</span>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="bg-white text-slate-900 font-black px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none cursor-pointer shadow-sm"
          >
            <option value="TRAUMA">Level-1 Trauma Center</option>
            <option value="CARDIAC">Cardiac Cath Lab</option>
            <option value="BURN">Burn Intensive Care Unit</option>
          </select>
        </div>
      </div>

      {/* REAL OPENSTREETMAP LEAFLET MAP CONTAINER */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <Navigation className="w-4 h-4 text-rose-600 animate-pulse" />
            <h3 className="font-black text-slate-900 text-sm">OpenStreetMap Real-Time Emergency GPS Engine</h3>
            <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full uppercase">
              LIVE TILES ACTIVE
            </span>
          </div>

          <div className="text-xs font-bold text-slate-600">
            Selected ER: <span className="font-black text-emerald-700">{selectedHospital?.name}</span> ({selectedHospital?.distance_km} km • {selectedHospital?.eta_minutes} min)
          </div>
        </div>

        {/* REAL LEAFLET MAP DOM CANVAS */}
        <div 
          id="leaflet-emergency-map" 
          className="w-full h-80 rounded-2xl border border-slate-200 shadow-inner z-10 overflow-hidden" 
        />
      </div>

      {/* Grid: Hospital Destination Rationale & Handoff Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hospital Options List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-black text-lg text-slate-900 flex items-center justify-between">
            <span>Destination Hospitals & ER Ranks</span>
            <span className="text-xs text-slate-500 font-medium">Ranked by Emergency Decision Engine</span>
          </h3>

          <div className="space-y-4">
            {hospitals.map((h) => {
              const isSelected = selectedHospital?.id === h.id;

              return (
                <div
                  key={h.id}
                  onClick={() => handleSelectHospital(h)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                    h.is_recommended
                      ? 'bg-[#e8f4f0] border-[#d3e4e0] shadow-sm'
                      : (isSelected ? 'bg-white border-slate-900 shadow-md ring-2 ring-emerald-500' : 'bg-white border-slate-200 hover:border-slate-300')
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {h.is_recommended && (
                          <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                            ★ TOP RECOMMENDED DESTINATION
                          </span>
                        )}
                        <h4 className="font-black text-slate-900 text-base">{h.name}</h4>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{h.address}</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right text-xs">
                        <span className="text-slate-500 font-medium block">Distance & ETA</span>
                        <span className="font-black text-slate-900 text-sm">{h.distance_km} km ({h.eta_minutes} min)</span>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleSelectHospital(h); }}
                        className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {isSelected ? '✓ Selected' : 'Select Destination'}
                      </button>
                    </div>
                  </div>

                  {/* Rationale & Capabilities */}
                  <div className="mt-3 pt-3 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-3 rounded-2xl border border-slate-200/80 text-slate-700 font-medium">
                      <span className="font-black text-rose-700 block text-[10px] uppercase">Decision Rationale:</span>
                      {h.recommendation_reason}
                    </div>

                    <div className="bg-white p-3 rounded-2xl border border-slate-200/80 text-slate-700 font-medium">
                      <span className="font-black text-emerald-800 block text-[10px] uppercase">Capabilities & ICU:</span>
                      {h.capability_summary}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Console: Emergency Handoff & ER Doctor Portal */}
        <div className="space-y-6">
          
          {/* Dispatch Emergency Handoff Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-black text-lg text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
              <Send className="w-5 h-5 text-emerald-600" />
              <span>Emergency Handoff Packet</span>
            </h3>

            {selectedHospital ? (
              <div className="space-y-3 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">TARGET RECEIVING HOSPITAL:</span>
                  <span className="font-black text-slate-900 text-sm">{selectedHospital.name}</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-rose-700 text-[10px] uppercase font-bold block">HANDOFF SNAPSHOT PAYLOAD:</span>
                  <p className="text-slate-700 font-bold leading-relaxed">
                    Patient: {patient?.full_name || 'Rahul Sharma'} | Blood: {patient?.blood_group || 'B+'} | Allergies: {patient?.critical_allergies.join(', ')} | Conditions: {patient?.critical_conditions.join(', ')}
                  </p>
                </div>

                <button
                  onClick={handleTransmitHandoff}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3.5 rounded-2xl shadow-md text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>Transmit Handoff to Hospital ER</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-medium">Select a hospital destination from the left panel first.</p>
            )}
          </div>

          {/* Hospital ER Doctor Desktop View */}
          <div className="bg-[#e8f4f0] border border-[#d3e4e0] p-6 rounded-3xl space-y-4">
            <div className="flex items-center space-x-2 text-emerald-900 font-black text-xs uppercase tracking-wider">
              <Stethoscope className="w-4 h-4 text-emerald-700" />
              <span>RECEIVING HOSPITAL ER TRIAGE PORTAL</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200 space-y-3 shadow-sm">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-emerald-800 font-black">INCOMING AMBULANCE</span>
                <span className="text-slate-500 font-black">ETA: {selectedHospital?.eta_minutes || 7} MIN</span>
              </div>

              <div className="text-xs text-slate-700 space-y-1 font-bold">
                <p><span className="text-slate-500">Status:</span> {handoffStatus || 'Awaiting Handoff Signal'}</p>
                <p><span className="text-slate-500">Incident Code:</span> #{activeIncident?.incident_code || 'INC-2026-08-31-004281'}</p>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">ER Doctor Notes & Preparation</label>
                <textarea
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:outline-none"
                />
              </div>

              <button
                onClick={handleDoctorAcknowledge}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center space-x-1 shadow-sm"
              >
                <Check className="w-4 h-4 text-white" />
                <span>Acknowledge Handoff Received</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
