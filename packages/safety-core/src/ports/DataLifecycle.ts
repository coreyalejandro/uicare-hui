/**
 * PORT: DataLifecycle
 * Controls data retention, export, and deletion at user request.
 * Core calls this when consent is revoked or user requests erasure.
 * INVARIANT_011: No storage APIs in core.
 */
export interface DataLifecycle {
  /** Delete all data for a user (consent revocation or right-to-erasure). */
  purgeUser(userId: string): Promise<void>;
  /** Export all user data as a serializable object for portability. */
  exportUser(userId: string): Promise<Record<string, unknown>>;
}
