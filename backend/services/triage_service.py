from typing import List, Dict, Any

def calculate_news2(
    respiratory_rate: int,  # breaths/min (e.g. 12-20 normal)
    sp02: float,            # % (e.g. >= 96 normal)
    systolic_bp: int,       # mmHg (e.g. 111-219 normal)
    pulse_rate: int,        # bpm (e.g. 51-90 normal)
    consciousness: str,     # "ALERT", "CVPU" (Confusion, Voice, Pain, Unresponsive)
    temperature: float,     # Celsius (e.g. 36.1 - 38.0 normal)
    on_oxygen: bool = False
) -> Dict[str, Any]:
    """
    National Early Warning Score 2 (NEWS2) Calculator Engine
    Returns total score, risk level, and clinical response protocol.
    """
    score = 0
    subscores = {}

    # 1. Respiratory Rate
    if respiratory_rate <= 8:
        subscores["respiratory_rate"] = 3
    elif 9 <= respiratory_rate <= 11:
        subscores["respiratory_rate"] = 1
    elif 12 <= respiratory_rate <= 20:
        subscores["respiratory_rate"] = 0
    elif 21 <= respiratory_rate <= 24:
        subscores["respiratory_rate"] = 2
    else:
        subscores["respiratory_rate"] = 3

    # 2. SpO2 (Scale 1)
    if sp02 >= 96:
        subscores["sp02"] = 0
    elif 94 <= sp02 <= 95:
        subscores["sp02"] = 1
    elif 92 <= sp02 <= 93:
        subscores["sp02"] = 2
    else:
        subscores["sp02"] = 3

    # 3. Air or Oxygen
    if on_oxygen:
        subscores["air_or_oxygen"] = 2
    else:
        subscores["air_or_oxygen"] = 0

    # 4. Systolic BP
    if systolic_bp <= 90:
        subscores["systolic_bp"] = 3
    elif 91 <= systolic_bp <= 100:
        subscores["systolic_bp"] = 2
    elif 101 <= systolic_bp <= 110:
        subscores["systolic_bp"] = 1
    elif 111 <= systolic_bp <= 219:
        subscores["systolic_bp"] = 0
    else:
        subscores["systolic_bp"] = 3

    # 5. Pulse Rate
    if pulse_rate <= 40:
        subscores["pulse_rate"] = 3
    elif 41 <= pulse_rate <= 50:
        subscores["pulse_rate"] = 1
    elif 51 <= pulse_rate <= 90:
        subscores["pulse_rate"] = 0
    elif 91 <= pulse_rate <= 110:
        subscores["pulse_rate"] = 1
    elif 111 <= pulse_rate <= 130:
        subscores["pulse_rate"] = 2
    else:
        subscores["pulse_rate"] = 3

    # 6. Consciousness (Alert = 0, CVPU = 3)
    if consciousness.upper() == "ALERT":
        subscores["consciousness"] = 0
    else:
        subscores["consciousness"] = 3

    # 7. Temperature
    if temperature <= 35.0:
        subscores["temperature"] = 3
    elif 35.1 <= temperature <= 36.0:
        subscores["temperature"] = 1
    elif 36.1 <= temperature <= 38.0:
        subscores["temperature"] = 0
    elif 38.1 <= temperature <= 39.0:
        subscores["temperature"] = 1
    else:
        subscores["temperature"] = 2

    total_score = sum(subscores.values())

    # Determine Clinical Risk Category
    if total_score == 0:
        risk_level = "LOW"
        recommendation = "Standard ward-level monitoring (12-hourly monitoring)."
    elif 1 <= total_score <= 4:
        risk_level = "LOW"
        recommendation = "Prompt assessment by registered nurse (4-6 hourly monitoring)."
    elif 5 <= total_score <= 6 or any(v == 3 for v in subscores.values()):
        risk_level = "MEDIUM"
        recommendation = "Urgent clinical review by competent emergency physician (Hourly monitoring)."
    else:
        risk_level = "HIGH"
        recommendation = "EMERGENCY RESPONSE: Immediate assessment by ICU/Trauma specialist & transfer to critical care unit."

    return {
        "news2_score": total_score,
        "risk_level": risk_level,
        "recommendation": recommendation,
        "subscores": subscores,
        "is_red_flag": total_score >= 7 or any(v == 3 for v in subscores.values())
    }


COMMON_CONTRAINDICATIONS = [
    {
        "medication": "Penicillin",
        "allergy_triggers": ["penicillin", "amoxicillin", "ampicillin", "beta-lactam"],
        "severity": "CRITICAL",
        "warning": "HIGH RISK: Patient has documented Penicillin / Beta-Lactam allergy. Risk of Anaphylaxis!"
    },
    {
        "medication": "Aspirin",
        "allergy_triggers": ["aspirin", "nsaid", "ibuprofen", "bleeding disorder", "ulcer"],
        "severity": "HIGH",
        "warning": "WARNING: Patient has active NSAID allergy or peptic ulcer history."
    },
    {
        "medication": "Morphine",
        "allergy_triggers": ["morphine", "opioid", "codeine", "severe asthma"],
        "severity": "CRITICAL",
        "warning": "CRITICAL: Opioid allergy or respiratory depression contraindication detected."
    },
    {
        "medication": "Epinephrine",
        "allergy_triggers": ["glaucoma", "arrhythmia", "severe hypertension"],
        "severity": "MEDIUM",
        "warning": "CAUTION: Use with extreme care if severe hypertension or cardiac arrhythmia is present."
    },
    {
        "medication": "Heparin",
        "allergy_triggers": ["heparin", "thrombocytopenia", "active bleeding"],
        "severity": "CRITICAL",
        "warning": "CRITICAL CONTRAINDICATION: Active bleeding or HIT history."
    }
]

def check_medication_safety(
    requested_drugs: List[str],
    critical_allergies: List[str],
    active_medications: List[str]
) -> Dict[str, Any]:
    """
    Checks requested emergency medications against patient's critical allergies and active drugs.
    """
    warnings = []
    is_safe = True

    allergies_text = " ".join([a.lower() for a in critical_allergies])
    active_meds_text = " ".join([m.lower() for m in active_medications])

    for drug in requested_drugs:
        drug_lower = drug.lower()
        for rule in COMMON_CONTRAINDICATIONS:
            if rule["medication"].lower() in drug_lower:
                for trigger in rule["allergy_triggers"]:
                    if trigger in allergies_text or trigger in active_meds_text:
                        is_safe = False
                        warnings.append({
                            "requested_drug": drug,
                            "triggered_by": trigger,
                            "severity": rule["severity"],
                            "warning": rule["warning"]
                        })
                        break

    return {
        "is_safe": is_safe,
        "warning_count": len(warnings),
        "warnings": warnings,
        "checked_drugs": requested_drugs
    }
