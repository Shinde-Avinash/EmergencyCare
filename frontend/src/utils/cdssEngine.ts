/**
 * Clinical Decision Support System (CDSS) & ESI Triage Engine
 * Calculates Emergency Severity Index (ESI 1-5), qSOFA Sepsis Risk, and Emergency Protocol Recommendations.
 */

export interface CDSSAssessment {
  esiLevel: number;
  esiCategory: string;
  esiColor: string;
  qSofaScore: number;
  sepsisRisk: 'Low' | 'Moderate' | 'High';
  priorityAction: string;
  recommendedProtocols: string[];
}

export function evaluateCDSS(patient: any): CDSSAssessment {
  const allergies = (patient?.critical_allergies || '').toLowerCase();
  const conditions = (patient?.chronic_conditions || '').toLowerCase();
  const summary = (patient?.ai_summary || '').toLowerCase();

  let esiLevel = 3;
  let esiCategory = "Level 3: Urgent / Resource Intensive";
  let esiColor = "bg-amber-500 text-white";
  let priorityAction = "Standard Emergency Nursing Triage & Monitoring";
  const recommendedProtocols: string[] = ["Continuous Pulse Oximetry", "IV Line Access", "12-Lead ECG"];

  // ESI Level 1: Life-threatening resuscitation
  if (summary.includes('cardiac arrest') || summary.includes('unconscious') || summary.includes('anaphylactic shock')) {
    esiLevel = 1;
    esiCategory = "Level 1: Immediate Life Resuscitation Required 🚨";
    esiColor = "bg-rose-700 text-white animate-pulse";
    priorityAction = "Immediate Airway Management & Resuscitation Team Alert";
    recommendedProtocols.unshift("Immediate Endotracheal Intubation", "IV Epinephrine 1mg", "Defibrillator Standby");
  } 
  // ESI Level 2: High Risk / Confused / Severe Distress
  else if (allergies.includes('penicillin') || conditions.includes('asthma') || summary.includes('asthma') || summary.includes('severe')) {
    esiLevel = 2;
    esiCategory = "Level 2: High Risk / High Emergency Priority ⚠️";
    esiColor = "bg-rose-600 text-white";
    priorityAction = "Immediate ER Bed Assignment & High-Flow Oxygen";
    recommendedProtocols.unshift("Nebulized Albuterol + Ipratropium", "Avoid Beta-Lactam Antibiotics (Penicillin Allergy)", "Stat ABG Analysis");
  }

  // qSOFA Sepsis Evaluation
  let qSofaScore = 0;
  if (summary.includes('fever') || summary.includes('sepsis')) qSofaScore += 1;
  if (summary.includes('hypotension') || summary.includes('bp low')) qSofaScore += 1;
  if (summary.includes('altered') || summary.includes('confused')) qSofaScore += 1;

  let sepsisRisk: 'Low' | 'Moderate' | 'High' = 'Low';
  if (qSofaScore >= 2) {
    sepsisRisk = 'High';
    recommendedProtocols.push("Stat Blood Cultures x2", "Broad Spectrum Antibiotics < 1 Hour", "IV Normal Saline 30mL/kg Bolus");
  } else if (qSofaScore === 1) {
    sepsisRisk = 'Moderate';
  }

  return {
    esiLevel,
    esiCategory,
    esiColor,
    qSofaScore,
    sepsisRisk,
    priorityAction,
    recommendedProtocols
  };
}
