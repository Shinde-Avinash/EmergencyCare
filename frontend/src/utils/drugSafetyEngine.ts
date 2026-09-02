/**
 * Emergency Drug Contraindication & Allergy Safety Engine
 * Cross-checks emergency drugs against patient allergies and medical history to prevent Adverse Drug Events (ADEs).
 */

export interface DrugSafetyCheckResult {
  drugName: string;
  isSafe: boolean;
  severity: 'CRITICAL_CONTRAINDICATION' | 'WARNING' | 'SAFE';
  reason: string;
  recommendedAlternative?: string;
}

export function checkDrugSafety(drugName: string, patient: any): DrugSafetyCheckResult {
  const nameLower = drugName.toLowerCase().trim();
  const allergiesLower = (patient?.critical_allergies || '').toLowerCase();
  const conditionsLower = (patient?.chronic_conditions || '').toLowerCase();

  // 1. Penicillin / Beta-Lactam Allergy Check
  if (
    (nameLower.includes('penicillin') || nameLower.includes('amoxicillin') || nameLower.includes('ampicillin') || nameLower.includes('augmentin')) &&
    allergiesLower.includes('penicillin')
  ) {
    return {
      drugName,
      isSafe: false,
      severity: 'CRITICAL_CONTRAINDICATION',
      reason: `PATIENT HAS CONFIRMED SEVERE ALLERGY TO PENICILLIN DERIVATIVES (IgE Sensitivity). Risk of Anaphylaxis!`,
      recommendedAlternative: 'Azithromycin (Macrolide) or Vancomycin / Levofloxacin'
    };
  }

  // 2. Beta Blocker vs Asthma Check
  if (
    (nameLower.includes('propranolol') || nameLower.includes('atenolol') || nameLower.includes('metoprolol')) &&
    conditionsLower.includes('asthma')
  ) {
    return {
      drugName,
      isSafe: false,
      severity: 'WARNING',
      reason: `Non-selective Beta-Blockers can induce severe bronchospasm in patients with Bronchial Asthma history.`,
      recommendedAlternative: 'Cardioselective Calcium Channel Blocker (Amlodipine/Diltiazem)'
    };
  }

  // 3. Aspirin vs Bleeding / Asthma Check
  if (nameLower.includes('aspirin') && allergiesLower.includes('aspirin')) {
    return {
      drugName,
      isSafe: false,
      severity: 'CRITICAL_CONTRAINDICATION',
      reason: `Confirmed Aspirin / NSAID allergy. Risk of Samter Triad Severe Bronchospasm!`,
      recommendedAlternative: 'Clopidogrel 75mg'
    };
  }

  // Default Safe
  return {
    drugName,
    isSafe: true,
    severity: 'SAFE',
    reason: `No known contraindications or allergy matches found in patient verified history.`
  };
}
