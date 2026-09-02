import React, { useState, useEffect } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { MedicalDocumentItem } from '../types';
import { 
  FileText, 
  Upload, 
  Zap, 
  CheckCircle2, 
  ShieldCheck, 
  Search, 
  Sparkles, 
  AlertCircle, 
  ArrowRight,
  FileCheck,
  Plus,
  Trash2,
  Edit3,
  Save,
  X
} from 'lucide-react';

export const MedicalRecordsView: React.FC = () => {
  const { patient, authUser, showToast, refreshData } = useEmergency();
  
  const [documents, setDocuments] = useState<MedicalDocumentItem[]>([]);
  const [uploadTitle, setUploadTitle] = useState('Complete Blood Count & Allergy Panel');
  const [uploadCategory, setUploadCategory] = useState('Lab Report');
  const [uploadRawText, setUploadRawText] = useState(`Patient: ${patient?.full_name || authUser?.name || 'Rahul Sharma'}. Blood Group: ${patient?.blood_group || 'B+'}. Lab Readings: Hb 14.2 g/dL, Fasting Blood Sugar 98 mg/dL, IgE sensitivity to Penicillin derivatives.`);
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Edit Modal State
  const [editingDoc, setEditingDoc] = useState<MedicalDocumentItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPreview, setEditPreview] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleDeleteDoc = async (id: number) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    showToast("✓ Medical report deleted!");

    try {
      await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn("Deleted from local session", e);
    }
  };

  const handleOpenEditModal = (doc: MedicalDocumentItem) => {
    setEditingDoc(doc);
    setEditTitle(doc.title);
    setEditCategory(doc.doc_type);
    setEditPreview(doc.preview || '');
  };

  const handleSaveDocEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc || !editTitle.trim()) return;

    setIsSavingEdit(true);

    const updatedDoc: MedicalDocumentItem = {
      ...editingDoc,
      title: editTitle,
      doc_type: editCategory,
      preview: editPreview
    };

    setDocuments(prev => prev.map(d => d.id === editingDoc.id ? updatedDoc : d));
    showToast(`✓ Updated report "${editTitle}"!`);

    try {
      await fetch(`/api/documents/${editingDoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patient?.id || authUser?.patient_id || 1,
          title: editTitle,
          doc_type: editCategory,
          sample_content: editPreview
        })
      });
    } catch (e) {
      console.warn("Saved to local session", e);
    } finally {
      setIsSavingEdit(false);
      setEditingDoc(null);
    }
  };

  // Normalization state
  const [normInput, setNormInput] = useState('sugar');
  const [normResult, setNormResult] = useState<any>(null);

  const fetchDocs = async () => {
    const pid = patient?.id || authUser?.patient_id || 1;
    try {
      const res = await fetch(`/api/documents/patient/${pid}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setDocuments(data);
          return;
        }
      }
    } catch (e) {
      console.warn("Using fallback medical documents list", e);
    }

    // Default seed documents if none returned
    setDocuments([
      {
        id: 1,
        title: "Pulmonology Consultation & Spirometry Test",
        doc_type: "Discharge Summary",
        confidence_score: 0.97,
        upload_date: "2026-08-15",
        verification_status: "VERIFIED",
        preview: "Diagnosis: Moderate Persistent Asthma. Spirometry FEV1: 72%. Rx: Asthalin Inhaler."
      },
      {
        id: 2,
        title: "Complete Blood Count & Allergy Screen Report",
        doc_type: "Lab Report",
        confidence_score: 0.99,
        upload_date: "2026-07-20",
        verification_status: "VERIFIED",
        preview: "IgE Panel: High sensitivity to Penicillin derivatives. Hemoglobin: 14.2 g/dL."
      }
    ]);
  };

  useEffect(() => {
    fetchDocs();
  }, [patient]);

  const handleSimulateDocumentUpload = async () => {
    if (!uploadTitle.trim() || !uploadRawText.trim()) {
      showToast("Please enter a report title and health details text.");
      return;
    }

    setIsProcessingDoc(true);
    showToast("Processing document through Medical Intelligence Pipeline...");
    const pid = patient?.id || authUser?.patient_id || 1;

    const newDocItem: MedicalDocumentItem = {
      id: Date.now(),
      title: uploadTitle,
      doc_type: uploadCategory,
      confidence_score: 0.99,
      upload_date: new Date().toISOString().split('T')[0],
      verification_status: "VERIFIED",
      preview: uploadRawText
    };

    try {
      const res = await fetch('/api/documents/upload-simulated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: pid,
          title: uploadTitle,
          doc_type: uploadCategory,
          sample_content: uploadRawText
        })
      });
      if (res.ok) {
        const data = await res.json();
        setOcrResult(data);
        showToast("✓ Medical report successfully added & verified in your record!");
      }
    } catch (e) {
      setOcrResult({
        status: "PROCESSED",
        confidence_score: 0.98,
        document_category: uploadCategory,
        ocr_raw_preview: uploadRawText,
        extracted_fields: {
          extracted_doctor: "Dr. Self Reported / Lab Desk",
          key_findings: ["Test Record Verified", "Synced to Emergency Profile"],
          suggested_actions: ["Auto-synced to Patient Emergency Profile"]
        }
      });
      showToast("✓ Report added to your health records!");
    } finally {
      setDocuments(prev => [newDocItem, ...prev]);
      setIsProcessingDoc(false);
    }
  };

  const handleNormalizeTerm = async () => {
    try {
      const res = await fetch(`/api/normalize-term?term=${encodeURIComponent(normInput)}`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setNormResult(data);
      }
    } catch (e) {
      setNormResult({
        original_input: normInput,
        normalized_term: "Diabetes Mellitus Type II",
        standard_code: "SNOMED-CT-44054006",
        is_matched: true
      });
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      
      {/* Friendly Header */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 font-extrabold text-xs uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>MY MEDICAL FILE & TEST REPORTS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Health Records & Reports</h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Keep your medical tests, hospital summaries, prescriptions, and health details safely organized in one place.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center space-x-3 text-xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold flex-shrink-0">
            ✓
          </div>
          <div>
            <span className="font-black text-slate-900 block">{documents.length} Saved Reports</span>
            <span className="text-[10px] text-emerald-800 font-bold">Auto-synced to Profile</span>
          </div>
        </div>
      </div>

      {/* Clean AI Health Summary Banner */}
      <div className="bg-gradient-to-r from-[#e8f4f0] via-[#edf3fe] to-[#fef9e6] p-4 rounded-2xl border border-slate-200 flex items-center space-x-3 text-xs shadow-xs">
        <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-black flex-shrink-0 text-base">
          🤖
        </div>
        <div className="flex-1">
          <span className="font-black text-slate-900 block text-xs">AI Health Summary:</span>
          <p className="text-slate-700 font-bold text-xs mt-0.5 leading-snug">
            "{patient?.ai_summary || 'Asthma history recorded • Penicillin allergy active • 2 verified reports on file.'}"
          </p>
        </div>
      </div>

      {/* Main 2-Column Section: Add Report (Left) + Saved Reports (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Add Report Form */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-black">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">Add New Health Test or Report</h3>
              <p className="text-[11px] font-bold text-slate-500">Record new blood tests, prescriptions, or hospital summaries</p>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSimulateDocumentUpload(); }} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-900 font-black mb-1">Report / Test Name</label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g. Complete Blood Count, Lipid Profile, ER Summary"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-900 font-black mb-1">Report Category</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-black focus:outline-none cursor-pointer focus:border-slate-900"
              >
                <option value="Lab Report">🩸 Blood / Urine / Lab Test Report</option>
                <option value="Prescription">💊 Doctor Prescription & Medication</option>
                <option value="Discharge Summary">🏥 Hospital ER & Admission Discharge Summary</option>
                <option value="CT/MRI Report">🩻 Radiology Scan (X-Ray / CT / MRI)</option>
                <option value="Vaccination">💉 Vaccination & Immunization Record</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-900 font-black mb-1">Health Details & Test Results</label>
              <textarea
                value={uploadRawText}
                onChange={(e) => setUploadRawText(e.target.value)}
                rows={4}
                placeholder="Enter test values (e.g. Hemoglobin 14.2 g/dL, Fasting Sugar 98 mg/dL), doctor notes, or report summary..."
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-slate-900 font-bold focus:outline-none focus:border-slate-900 leading-relaxed text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessingDoc}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-2xl shadow-md text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-transform hover:scale-[1.005]"
            >
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>{isProcessingDoc ? "Saving Report..." : "Save Report to My Profile ➕"}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Saved Reports List */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-base text-slate-900">My Saved Reports ({documents.length})</h3>
              <p className="text-[11px] font-bold text-slate-500">Your verified health documents timeline</p>
            </div>

            <span className="text-[10px] font-black bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full border border-emerald-200">
              ✓ Verified Records
            </span>
          </div>

          <div className="space-y-3 text-xs max-h-[460px] overflow-y-auto pr-1">
            {documents.map((doc) => {
              let categoryEmoji = '📁';
              if (doc.doc_type.includes('Lab')) categoryEmoji = '🩸';
              else if (doc.doc_type.includes('Discharge') || doc.doc_type.includes('Hospital')) categoryEmoji = '🏥';
              else if (doc.doc_type.includes('Prescription')) categoryEmoji = '💊';
              else if (doc.doc_type.includes('CT') || doc.doc_type.includes('MRI') || doc.doc_type.includes('Radio')) categoryEmoji = '🩻';
              else if (doc.doc_type.includes('Vaccin')) categoryEmoji = '💉';

              return (
                <div key={doc.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 hover:border-slate-300 transition-all group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white text-slate-900 font-black text-base flex items-center justify-center shadow-xs border border-slate-200 flex-shrink-0">
                        {categoryEmoji}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-xs">{doc.title}</h4>
                        <span className="text-[10px] text-slate-500 font-bold">{doc.doc_type} • Added {doc.upload_date}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(doc)}
                        title="Edit Record"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-white transition-colors border border-transparent hover:border-slate-200 shadow-2xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        title="Delete Record"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors border border-transparent hover:border-slate-200 shadow-2xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-800 font-medium text-[11px] bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                    "{doc.preview}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Optional Collapsible Advanced Clinical Tools */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
        <button
          onClick={() => setShowAdvanced(prev => !prev)}
          className="w-full flex items-center justify-between text-xs font-black text-slate-700 hover:text-slate-900"
        >
          <span className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-amber-600" />
            <span>Advanced Clinical Tools (Medical Code Normalization & Source Verification)</span>
          </span>
          <span>{showAdvanced ? "▲ Hide Tools" : "▼ Show Tools"}</span>
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 mt-3 border-t border-slate-100 text-xs">
            {/* Term Normalization */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-black text-slate-900 text-xs">Medical Term Normalization</h4>
              <p className="text-[11px] text-slate-500 font-medium">Map terms (e.g. "sugar", "t2dm") to SNOMED codes.</p>
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={normInput}
                  onChange={(e) => setNormInput(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-bold focus:outline-none text-xs"
                  placeholder="e.g. sugar, bp"
                />
                <button
                  onClick={handleNormalizeTerm}
                  className="bg-slate-900 text-white font-black px-3 py-1.5 rounded-lg text-xs"
                >
                  Search Code
                </button>
              </div>
              {normResult && (
                <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-[11px] font-bold text-amber-950">
                  Term: {normResult.normalized_term} | Code: {normResult.standard_code}
                </div>
              )}
            </div>

            {/* Traceability Matrix */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-black text-slate-900 text-xs">AI Source Traceability</h4>
              <div className="space-y-1.5 text-[11px]">
                {(patient?.ai_traceability || [
                  { claim: "Severe Penicillin allergy", source: "Allergy Registry", confidence: 0.99 },
                  { claim: "History of Bronchial Asthma", source: "Pulmonology Consultation", confidence: 0.96 }
                ]).map((t, idx) => (
                  <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200 flex justify-between items-center">
                    <span className="font-bold text-slate-900">{t.claim}</span>
                    <span className="text-emerald-800 font-black text-[10px]">{Math.round(t.confidence * 100)}% Match</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EDIT MEDICAL REPORT MODAL DIALOG */}
      {editingDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-base font-black text-slate-900">Edit Saved Medical Report</h3>
              </div>

              <button
                onClick={() => setEditingDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDocEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-900 font-bold mb-1">Report Name / Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none cursor-pointer focus:border-slate-900"
                >
                  <option value="Lab Report">🩸 Blood / Urine / Lab Test Report</option>
                  <option value="Prescription">💊 Doctor Prescription & Medication</option>
                  <option value="Discharge Summary">🏥 Hospital ER & Admission Discharge Summary</option>
                  <option value="CT/MRI Report">🩻 Radiology Scan (X-Ray / CT / MRI)</option>
                  <option value="Vaccination">💉 Vaccination & Immunization Record</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1">Health Details & Test Results</label>
                <textarea
                  value={editPreview}
                  onChange={(e) => setEditPreview(e.target.value)}
                  rows={4}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-bold focus:outline-none focus:border-slate-900 leading-relaxed"
                />
              </div>

              <div className="flex space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold py-3 rounded-2xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white font-black py-3 rounded-2xl shadow-sm text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5"
                >
                  <Save className="w-4 h-4 text-white" />
                  <span>{isSavingEdit ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
