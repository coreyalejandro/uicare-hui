/**
 * Risk Scorer
 * Pure TypeScript. Zero dependencies.
 *
 * Migrated and purified from uicare-system/web/src/lib/maniaService.ts.
 * Original used module-level mutable state (memory leak / session bleed risk).
 * This implementation is a pure function with explicit baseline injection.
 */

import type { BehavioralSignal } from "../ports/SignalCollector.js";

export interface WearableBaseline {
  heartRateDelta: number;
  sleepDeficitDelta: number;
  activityDelta: number;
  sampleCount: number;
}

/**
 * Update the running baseline with a new signal using Welford's online algorithm.
 * Returns a new baseline object (immutable update pattern).
 */
export function updateBaseline(
  current: WearableBaseline | null,
  signal: BehavioralSignal
): WearableBaseline {
  if (!current) {
    return {
      heartRateDelta: signal.heartRateDelta,
      sleepDeficitDelta: signal.sleepDeficitDelta,
      activityDelta: signal.activityDelta,
      sampleCount: 1,
    };
  }

  const n = current.sampleCount + 1;
  return {
    heartRateDelta: current.heartRateDelta + (signal.heartRateDelta - current.heartRateDelta) / n,
    sleepDeficitDelta: current.sleepDeficitDelta + (signal.sleepDeficitDelta - current.sleepDeficitDelta) / n,
    activityDelta: current.activityDelta + (signal.activityDelta - current.activityDelta) / n,
    sampleCount: n,
  };
}

/**
 * Compute composite risk score 0–1 from signal deltas relative to baseline.
 *
 * Weights (matching original maniaService proportions):
 *   heartRate: 0.33
 *   sleep:     0.34
 *   activity:  0.33
 *
 * Text volume adds a small overlay (0–0.10) to catch behavioral text surges.
 */
export function computeRiskScore(
  signal: BehavioralSignal,
  baseline: WearableBaseline | null
): number {
  if (!baseline || baseline.sampleCount < 3) {
    // Cold start: no reliable baseline yet. Return low-confidence floor score.
    return 0.0;
  }

  const hrContrib  = Math.max(0, signal.heartRateDelta - baseline.heartRateDelta) * 0.33;
  const slpContrib = Math.max(0, signal.sleepDeficitDelta - baseline.sleepDeficitDelta) * 0.34;
  const actContrib = Math.max(0, signal.activityDelta - baseline.activityDelta) * 0.33;

  // Text volume overlay: > 5000 chars in recent session = mild signal
  const textOverlay = Math.min(0.10, signal.textVolumeRecent / 50_000);

  const raw = hrContrib + slpContrib + actContrib + textOverlay;
  return Math.min(1.0, raw);
}
