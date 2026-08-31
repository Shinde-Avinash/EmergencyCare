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
  FileCheck
} from 'lucide-react';

export const MedicalRecordsView: React.FC = () => {
  const { patient, showToast, refreshData } = useEmergency();
  
  const [documents, setDocuments] = useState<MedicalDocumentItem[]>([]);
  const [uploadTitle, setUploadTitle] = useState('Complete Blood Count & IgE Allergy Panel');
  const [uploadCategory, setUploadCategory] = useState('Lab Report');
  const [uploadRawText, setUploadRawText] = useState('Patient Rahul Sharma. IgE Panel: High sensitivity to Penicillin G derivatives. Hb: 14.2 g/dL.');
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);

  // Normalization state
  const [normInput, setNormInput] = useState('sugar');
  const [normResult, setNormResult] = useState<any>(null);

  const fetchDocs = async () => {
    try {
      const res = await fetch('/api/documents/patient/1');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (e) {
      setDocuments([
        {
          id: 1,
          title: "Pulmonology Consultation & Spirometry",
          doc_type: "Discharge Summary",
          confidence_score: 0.97,
          upload_date: "2026-08-15",
          verification_status: "VERIFIED",
          preview: "Diagnosis: Moderate Persistent Asthma. Spirometry FEV1: 72%. Rx: Asthalin Inhaler."
        },
        {
          id: 2,
          title: "Complete Blood Count & Allergy Screen",
          doc_type: "Lab Report",
          confidence_score: 0.99,
          upload_date: "2026-07-20",
          verification_status: "VERIFIED",
          preview: "IgE Panel: Severe Penicillin allergy flagged. WBC 7.4k."
        }
      ]);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleSimulateDocumentUpload = async () => {
    setIsProcessingDoc(true);
    showToast("Processing document through OCR & Classification Pipeline...");

    try {
      const res = await fetch('/api/documents/upload-simulated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadTitle,
          doc_type: uploadCategory,
          sample_content: uploadRawText
        })
      });
      if (res.ok) {
        const data = await res.json();
        setOcrResult(data);
        setIsProcessingDoc(false);
        showToast("✓ Medical Document successfully processed & structured into timeline!");
        await fetchDocs();
      }
    } catch (e) {
      setOcrResult({
        status: "PROCESSED",
        confidence_score: 0.98,
        document_category: uploadCategory,
        ocr_raw_preview: uploadRawText,
        extracted_fields: {
          extracted_doctor: "Dr. Rajesh Sharma, MD",
          key_findings: ["Penicillin allergy confirmed", "Normal Hemoglobin"],
          suggested_actions: ["Auto-synced to Patient Emergency Profile"]
        }
      });
      setIsProcessingDoc(false);
      showToast("✓ Document processed (Offline simulator)!");
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
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 text-rose-400" />
            <span>MODULE 4, 5 & 6: AI CLINICAL ENGINE & DOCUMENT INTELLIGENCE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">AI Context & Document OCR</h2>
          <p className="text-xs text-slate-400 mt-1">
            Extract medical insights from raw reports, generate traceable emergency summaries, & normalize terms.
          </p>
        </div>
      </div>

      {/* Grid: AI Summary with Traceability & Terminology Normalization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI Emergency Clinical Summary with Source Traceability */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 lg:col-span-2 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-lg text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-rose-400" />
              <span>AI Emergency Summary & Traceability Matrix</span>
            </h3>
            <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30">
              NON-DIAGNOSTIC DECISION SUPPORT
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="text-xs font-bold text-slate-400 block uppercase">Synthesized Summary Text:</span>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              "{patient?.ai_summary}"
            </p>
          </div>

          {/* Traceability Claims List */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Source Traceability Verification
            </h4>

            <div className="space-y-2">
              {(patient?.ai_traceability || [
                { claim: "Severe Penicillin allergy", source: "Verified Allergy Registry (Dr. Mehta Clinic)", confidence: 0.99 },
                { claim: "History of Bronchial Asthma", source: "Pulmonology Consultation #P-9021", confidence: 0.96 }
              ]).map((t, idx) => (
                <div key={idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-rose-300 block">Claim: "{t.claim}"</span>
                    <span className="text-slate-400 text-[11px]">Source Record: {t.source}</span>
                  </div>
                  <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-md text-[10px] font-bold self-start sm:self-center">
                    Match Confidence: {Math.round(t.confidence * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Medical Data Normalization Tool */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-lg text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
            <Search className="w-5 h-5 text-amber-400" />
            <span>Module 6: Medical Normalization</span>
          </h3>

          <p className="text-xs text-slate-400">
            Map vernacular medical terms (e.g. "sugar", "t2dm") to standard clinical SNOMED/ICD-10 codes.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Enter Vernacular Term</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={normInput}
                  onChange={(e) => setNormInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none"
                  placeholder="e.g. sugar, bp, pencillin"
                />
                <button
                  onClick={handleNormalizeTerm}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-3 py-2 rounded-xl"
                >
                  Map
                </button>
              </div>
            </div>

            {normResult && (
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>INPUT: "{normResult.original_input}"</span>
                  <span className="text-emerald-400 font-bold">✓ SNOMED MAPPED</span>
                </div>
                <h4 className="font-extrabold text-white text-sm">{normResult.normalized_term}</h4>
                <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded inline-block">
                  Code: {normResult.standard_code}
                </span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Module 5: Document Intelligence & OCR Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upload Form */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-lg text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
            <Upload className="w-5 h-5 text-rose-400" />
            <span>Document Intelligence Dropzone & OCR</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Document Title</label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Document Classification Category</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none"
              >
                <option value="Lab Report">Lab Report (Blood / Urine / Serology)</option>
                <option value="Prescription">Prescription Document</option>
                <option value="Discharge Summary">Hospital Discharge Summary</option>
                <option value="CT/MRI Report">Radiology CT / MRI Report</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Raw Document OCR Text Input</label>
              <textarea
                value={uploadRawText}
                onChange={(e) => setUploadRawText(e.target.value)}
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-mono text-[11px] focus:outline-none"
              />
            </div>

            <button
              onClick={handleSimulateDocumentUpload}
              disabled={isProcessingDoc}
              className="w-full bg-gradient-to-r from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 text-white font-extrabold py-3 rounded-xl shadow-lg text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
            >
              <FileCheck className="w-4 h-4" />
              <span>{isProcessingDoc ? "Running OCR & Extraction..." : "Run OCR & Structure into Timeline"}</span>
            </button>
          </div>
        </div>

        {/* Uploaded Documents List */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-lg text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Verified Patient Medical Documents</span>
            <span className="text-xs font-mono text-slate-400">{documents.length} Files</span>
          </h3>

          <div className="space-y-3 text-xs">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm">{doc.title}</h4>
                    <span className="text-[10px] text-slate-400">{doc.doc_type} • Uploaded {doc.upload_date}</span>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded">
                    Confidence: {Math.round(doc.confidence_score * 100)}%
                  </span>
                </div>

                <p className="text-slate-300 font-mono text-[11px] bg-slate-950 p-2 rounded border border-slate-850 line-clamp-2">
                  "{doc.preview}"
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
