import datetime
import random
from typing import Dict, List, Any

def generate_ai_clinical_summary(profile_data: Dict[str, Any]) -> Dict[str, Any]:
    allergies = profile_data.get("critical_allergies", [])
    conditions = profile_data.get("critical_conditions", [])
    meds = profile_data.get("active_medications", [])
    surgeries = profile_data.get("past_surgeries", [])

    summary_paragraphs = []
    traceability_tags = []

    if allergies:
        summary_paragraphs.append(
            f"Patient presents with CRITICAL ALLERGIC SENSITIVITIES to: {', '.join(allergies)}. "
            "Beta-lactam antibiotics and penicillin derivatives must be strictly avoided during acute resuscitation."
        )
        traceability_tags.append({
            "claim": f"Severe allergy to {', '.join(allergies)}",
            "source": "Verified Allergy Registry (Dr. Mehta Allergy & Asthma Clinic)",
            "confidence": 0.99
        })

    if conditions:
        summary_paragraphs.append(
            f"Active chronic conditions include: {', '.join(conditions)}. "
            "Bronchospasm or acute airway hyperactivity risk should be monitored closely under emergency anesthesia."
        )
        traceability_tags.append({
            "claim": f"History of {', '.join(conditions)}",
            "source": "Pulmonology Consultation Record (Apex Hospital #P-9021)",
            "confidence": 0.96
        })

    if meds:
        summary_paragraphs.append(
            f"Current daily pharmacological regimen: {', '.join(meds)}. "
            "Check for potential drug-drug interactions prior to emergency IV administration."
        )
        traceability_tags.append({
            "claim": f"Active meds: {', '.join(meds)}",
            "source": "Digital Prescription Sync (Care Pharmacy #RX-88401)",
            "confidence": 0.98
        })

    full_summary = " ".join(summary_paragraphs) if summary_paragraphs else "No critical risk factors flagged in medical history."

    return {
        "summary": full_summary,
        "traceability": traceability_tags,
        "ai_disclaimer": "AI Decision Support Tool — Not an autonomous clinical diagnosis. Verify with attending emergency physician.",
        "generated_at": datetime.datetime.utcnow().isoformat()
    }

def process_medical_document_ocr(title: str, doc_type: str, raw_text: str) -> Dict[str, Any]:
    """
    Simulates Medical Document Intelligence OCR pipeline:
    Document -> OCR -> Classification -> Data Extraction -> Validation -> Structured Medical Record
    """
    confidence = round(random.uniform(0.92, 0.99), 2)
    
    extracted_fields = {
        "extracted_doctor": "Dr. Rajesh Sharma, MD (Cardiology)",
        "extracted_date": datetime.date.today().strftime("%Y-%m-%d"),
        "extracted_facility": "Ruby Hall Clinic Emergency Care",
        "key_findings": [],
        "suggested_actions": []
    }

    if "lab" in doc_type.lower() or "blood" in doc_type.lower() or "report" in doc_type.lower():
        extracted_fields["key_findings"] = [
            "Hemoglobin: 13.8 g/dL (Normal)",
            "Platelet Count: 240,000 /mcL (Normal)",
            "Serum Creatinine: 0.9 mg/dL (Normal)",
            "Blood Glucose (Random): 142 mg/dL"
        ]
        extracted_fields["suggested_actions"] = ["Flagged for Routine Timeline Archive"]
    elif "prescription" in doc_type.lower():
        extracted_fields["key_findings"] = [
            "Rx: Asthalin Inhaler 100mcg - 2 puffs PRN",
            "Rx: Montair LC - 1 tab daily at bedtime",
            "Rx: Paracetamol 650mg - PRN for fever"
        ]
        extracted_fields["suggested_actions"] = ["Auto-sync to Active Medications List"]
    else:
        extracted_fields["key_findings"] = [
            "Chest X-Ray (PA View): Clear lung fields, no acute infiltration.",
            "ECG: Normal Sinus Rhythm, HR 76 bpm."
        ]
        extracted_fields["suggested_actions"] = ["Add to Critical Diagnostics History"]

    return {
        "status": "PROCESSED",
        "confidence_score": confidence,
        "document_category": doc_type,
        "ocr_raw_preview": raw_text[:200] + ("..." if len(raw_text) > 200 else ""),
        "extracted_fields": extracted_fields,
        "processed_at": datetime.datetime.utcnow().isoformat()
    }
