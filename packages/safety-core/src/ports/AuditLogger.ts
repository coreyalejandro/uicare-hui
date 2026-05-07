/**
 * PORT: AuditLogger
 * Every safety decision, gate trigger, consent change, and invariant
 * violation must be recorded. Adapters write to IndexedDB or a remote log.
 * INVARIANT_011: Core only calls this port; no file/network in core.
 */
export type AuditEventType =
  | "STATE_TRANSITION"
  | "GATE_TRIGGERED"
  | "GATE_BYPASSED"
  | "INTERVENTION_SHOWN"
  | "INTERVENTION_DISMISSED"
  | "CONSENT_GRANTED"
  | "CONSENT_REVOKED"
  | "INVARIANT_VIOLATION"
  | "RISK_SCORE_COMPUTED"
  | "COLD_START"
  | "SESSION_START"
  | "SESSION_END";

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  userId: string;
  timestampMs: number;
  /** Structured payload. Must not contain PII beyond userId. */
  payload: Record<string, unknown>;
}

export interface AuditLogger {
  log(event: AuditEvent): Promise<void>;
  /** Query recent events (adapter-side filtering). Core does not call this. */
  query(userId: string, since: number): Promise<AuditEvent[]>;
}
