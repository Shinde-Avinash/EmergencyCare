from typing import Dict

NORMALIZATION_DICTIONARY: Dict[str, str] = {
    # Conditions
    "diabetes": "Diabetes Mellitus Type II",
    "t2dm": "Diabetes Mellitus Type II",
    "type 2 diabetes": "Diabetes Mellitus Type II",
    "sugar": "Diabetes Mellitus Type II",
    "bp": "Essential Hypertension",
    "high bp": "Essential Hypertension",
    "hypertension": "Essential Hypertension",
    "asthma": "Bronchial Asthma",
    "breathing problem": "Bronchial Asthma",

    # Allergies
    "penicillin": "Penicillin (Beta-Lactam Antibiotics)",
    "pencillin": "Penicillin (Beta-Lactam Antibiotics)",
    "sulfa": "Sulfonamide Antibiotics",
    "aspirin": "Aspirin (Non-Steroidal Anti-Inflammatory Drug)",

    # Medications
    "disprin": "Aspirin (100mg)",
    "asthalin": "Salbutamol Inhaler (100mcg)",
    "metformin": "Metformin Hydrochloride (500mg)",
    "glycomet": "Metformin Hydrochloride (500mg)"
}

def normalize_medical_term(term: str) -> dict:
    cleaned = term.strip().lower()
    normalized = NORMALIZATION_DICTIONARY.get(cleaned, term.strip().title())
    
    return {
        "original_input": term,
        "normalized_term": normalized,
        "standard_code": f"SNOMED-CT-{abs(hash(normalized)) % 1000000}",
        "is_matched": cleaned in NORMALIZATION_DICTIONARY
    }
