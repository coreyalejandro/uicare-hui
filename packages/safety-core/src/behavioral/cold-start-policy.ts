/**
 * Cold Start Policy
 * Pure TypeScript. Zero dependencies.
 *
 * Governs system behavior during the initial observation window before
 * a reliable baseline is established.
 */

import { COLD_START_OBSERVATION_WINDOW_MS } from "./state-machine.js";

export interface ColdStartStatus {
  isActive: boolean;
  /** Milliseconds remaining in observation window. 0 if window has passed. */
  remainingMs: number;
  /** Message to show if gates would fire during cold start. */
  suppressionReason: string;
}

export function evaluateColdStart(
  firstSignalMs: number | null,
  nowMs: number
): ColdStartStatus {
  if (firstSignalMs === null) {
    return {
      isActive: true,
      remainingMs: COLD_START_OBSERVATION_WINDOW_MS,
      suppressionReason: "No signals collected yet. Observation window pending.",
    };
  }

  const elapsed = nowMs - firstSignalMs;
  const remaining = Math.max(0, COLD_START_OBSERVATION_WINDOW_MS - elapsed);

  return {
    isActive: remaining > 0,
    remainingMs: remaining,
    suppressionReason: remaining > 0
      ? `Observation window active (${Math.ceil(remaining / 1000)}s remaining).`
      : "",
  };
}
