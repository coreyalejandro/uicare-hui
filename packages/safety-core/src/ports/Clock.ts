/**
 * PORT: Clock
 * Injects time so safety-core remains deterministic and testable.
 * INVARIANT_011: No Date or performance usage in core — always injected.
 */
export interface Clock {
  /** Returns current time as a Unix timestamp in milliseconds. */
  nowMs(): number;
}
