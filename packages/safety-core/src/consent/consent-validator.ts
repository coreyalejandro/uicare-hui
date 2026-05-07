/**
 * Consent Validator
 * Pure TypeScript. Zero dependencies.
 *
 * Validates the structural integrity of consent records.
 * Used by adapters before persisting records to catch corrupt state.
 */

import type { ConsentRecord } from "../ports/ConsentStore.js";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateConsentRecord(record: ConsentRecord): ValidationResult {
  const errors: string[] = [];

  if (!record.userId || record.userId.trim().length === 0) {
    errors.push("userId must not be empty.");
  }
  if (!record.feature || record.feature.trim().length === 0) {
    errors.push("feature must not be empty.");
  }
  if (!["GRANTED", "DENIED", "PENDING", "REVOKED"].includes(record.status)) {
    errors.push(`Invalid status: ${record.status}.`);
  }
  if (record.status === "GRANTED" && !record.grantedAtMs) {
    errors.push("GRANTED status requires grantedAtMs.");
  }
  if (record.status === "REVOKED" && !record.revokedAtMs) {
    errors.push("REVOKED status requires revokedAtMs.");
  }
  if (record.version < 1) {
    errors.push("version must be >= 1.");
  }

  return { valid: errors.length === 0, errors };
}
