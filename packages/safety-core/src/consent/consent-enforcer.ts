/**
 * Consent Enforcer
 * Pure TypeScript. Zero dependencies.
 *
 * Core runtime invariant: behavioral monitoring gates MUST NOT fire
 * unless consent is GRANTED. Consent revocation must take effect immediately.
 *
 * This module checks pre-loaded consent records (hydrated by the adapter).
 * It never touches storage — that is the ConsentStore adapter's job.
 */

import type { ConsentRecord, ConsentStatus } from "../ports/ConsentStore.js";

export interface ConsentCheckResult {
  allowed: boolean;
  status: ConsentStatus | "NOT_FOUND";
  reason: string;
}

export function checkConsent(
  records: ConsentRecord[],
  userId: string,
  feature: string
): ConsentCheckResult {
  const record = records.find(r => r.userId === userId && r.feature === feature);

  if (!record) {
    return {
      allowed: false,
      status: "NOT_FOUND",
      reason: `No consent record found for feature '${feature}'.`,
    };
  }

  if (record.status === "GRANTED") {
    return {
      allowed: true,
      status: "GRANTED",
      reason: "Consent granted.",
    };
  }

  return {
    allowed: false,
    status: record.status,
    reason: `Feature '${feature}' consent is ${record.status}. Access denied.`,
  };
}

/**
 * Compute the effective consent state after a revocation event.
 * Returns a new record with REVOKED status. Adapter must persist this.
 */
export function applyRevocation(
  record: ConsentRecord,
  revokedAtMs: number
): ConsentRecord {
  return {
    ...record,
    status: "REVOKED",
    revokedAtMs,
  };
}
