/**
 * Agency Preservation
 * Pure TypeScript. Zero dependencies.
 *
 * Enforces the principle that the system aids but never coerces.
 * Tracks override history to detect if the system is being overly restrictive
 * or if the user is consistently bypassing gates (escalation signal).
 */

export interface AgencyRecord {
  userId: string;
  overrideCount: number;
  groundingEngagedCount: number;
  hardBlockCount: number;
  lastEvaluatedMs: number;
}

export interface AgencyAssessment {
  systemOverlyRestrictive: boolean;
  userConsistentlyBypassing: boolean;
  recommendation: string;
}

export function assessAgency(record: AgencyRecord): AgencyAssessment {
  const bypassRatio = record.overrideCount / Math.max(1, record.hardBlockCount + record.overrideCount);
  const engagementRatio = record.groundingEngagedCount / Math.max(1, record.overrideCount + record.groundingEngagedCount);

  const systemOverlyRestrictive = record.overrideCount > 10 && engagementRatio < 0.2;
  const userConsistentlyBypassing = bypassRatio > 0.8 && record.overrideCount > 5;

  let recommendation = "System balance is healthy.";
  if (systemOverlyRestrictive) {
    recommendation = "Gate thresholds may be too low for this user. Consider recalibrating baseline.";
  } else if (userConsistentlyBypassing) {
    recommendation = "User consistently bypasses gates. Consider reviewing consent and adjusting engagement strategy.";
  }

  return { systemOverlyRestrictive, userConsistentlyBypassing, recommendation };
}
