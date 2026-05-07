/**
 * PORT: ConsentStore
 * Defines the contract for persisting and reading user consent records.
 * Core logic reads consent status synchronously via pre-loaded snapshots;
 * the adapter handles async I/O and fires callbacks.
 * INVARIANT_011: No storage APIs in core. This port is implemented by adapters.
 */
export type ConsentStatus = "GRANTED" | "DENIED" | "PENDING" | "REVOKED";

export interface ConsentRecord {
  userId: string;
  feature: string;
  status: ConsentStatus;
  grantedAtMs: number | null;
  revokedAtMs: number | null;
  version: number;
}

export interface ConsentStore {
  /** Load all consent records for a user. Called by adapter at session start. */
  loadAll(userId: string): Promise<ConsentRecord[]>;
  /** Persist a single consent record change. */
  save(record: ConsentRecord): Promise<void>;
  /** Revoke consent for a feature immediately. */
  revoke(userId: string, feature: string): Promise<void>;
}
