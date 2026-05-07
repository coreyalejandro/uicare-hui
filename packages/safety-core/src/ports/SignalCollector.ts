/**
 * PORT: SignalCollector
 * Secondary port. Adapters provide behavioral signal snapshots to core logic.
 * Implementations may read from sensors, UI events, or synthetic test fixtures.
 * INVARIANT_011: This interface lives in core; implementations live in adapters.
 */
export interface BehavioralSignal {
  /** Normalized 0–1. Higher means more elevated heart rate vs. baseline. */
  heartRateDelta: number;
  /** Normalized 0–1. Higher means more sleep deficit vs. baseline. */
  sleepDeficitDelta: number;
  /** Normalized 0–1. Higher means more activity deviation vs. baseline. */
  activityDelta: number;
  /** Text/content volume submitted in recent session. Raw character count. */
  textVolumeRecent: number;
  /** Unix ms of signal collection. Provided by adapter (not core). */
  collectedAtMs: number;
}

export interface SignalCollector {
  /** Retrieve the latest behavioral signal snapshot. */
  collect(): Promise<BehavioralSignal>;
}
