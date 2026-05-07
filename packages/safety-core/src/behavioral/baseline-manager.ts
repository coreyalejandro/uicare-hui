/**
 * Baseline Manager
 * Pure TypeScript. Zero dependencies.
 *
 * Manages the running wearable baseline as an immutable value.
 * Adapters persist and hydrate the baseline via a storage port;
 * core receives and returns plain objects.
 */

import type { BehavioralSignal } from "../ports/SignalCollector.js";
import { updateBaseline, type WearableBaseline } from "./risk-scorer.js";

export interface BaselineSnapshot {
  baseline: WearableBaseline | null;
  firstSignalMs: number | null;
  lastSignalMs: number | null;
  signalCount: number;
}

export function createEmptySnapshot(): BaselineSnapshot {
  return {
    baseline: null,
    firstSignalMs: null,
    lastSignalMs: null,
    signalCount: 0,
  };
}

export function ingestSignal(
  snapshot: BaselineSnapshot,
  signal: BehavioralSignal
): BaselineSnapshot {
  return {
    baseline: updateBaseline(snapshot.baseline, signal),
    firstSignalMs: snapshot.firstSignalMs ?? signal.collectedAtMs,
    lastSignalMs: signal.collectedAtMs,
    signalCount: snapshot.signalCount + 1,
  };
}
