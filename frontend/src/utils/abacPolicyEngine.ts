/**
 * Attribute-Based Access Control (ABAC) & Policy Engine
 * Evaluates context attributes (distance, emergency status, TTL, role) to authorize Break-Glass access.
 */

export interface ABACRuleResult {
  ruleName: string;
  passed: boolean;
  weight: number;
  explanation: string;
}

export interface ABACEvaluation {
  isAuthorized: boolean;
  confidenceScore: number;
  rulesEvaluated: ABACRuleResult[];
  auditSignature: string;
}

export function evaluateABACPolicy(
  userRole: string,
  emergencyActive: boolean = true,
  distanceKm: number = 1.2,
  ttlSeconds: number = 900
): ABACEvaluation {
  const rules: ABACRuleResult[] = [
    {
      ruleName: "Role Privilege Verification",
      passed: ["PARAMEDIC", "HOSPITAL_STAFF", "ADMIN", "BYSTANDER"].includes(userRole),
      weight: 30,
      explanation: `User role [${userRole}] has Break-Glass access clearance.`
    },
    {
      ruleName: "Active Emergency Incident Boundary",
      passed: emergencyActive,
      weight: 35,
      explanation: emergencyActive ? "Active Emergency Dispatch verified." : "No active dispatch linked."
    },
    {
      ruleName: "Geofence Proximity Threshold (< 5km)",
      passed: distanceKm <= 5.0,
      weight: 20,
      explanation: `Requester distance ${distanceKm.toFixed(1)} km is within emergency proximity zone.`
    },
    {
      ruleName: "Temporal Session TTL Window (> 0s)",
      passed: ttlSeconds > 0,
      weight: 15,
      explanation: `Session TTL remaining: ${Math.floor(ttlSeconds / 60)}m ${ttlSeconds % 60}s.`
    }
  ];

  const totalScore = rules.reduce((acc, r) => acc + (r.passed ? r.weight : 0), 0);
  const isAuthorized = totalScore >= 70;

  // Generate SHA-256 style mock audit signature
  const auditSignature = `0xabac${Math.random().toString(16).substring(2, 10)}${Date.now().toString(16)}`;

  return {
    isAuthorized,
    confidenceScore: totalScore,
    rulesEvaluated: rules,
    auditSignature
  };
}
