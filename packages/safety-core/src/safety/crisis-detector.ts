/**
 * Crisis Detector
 * Pure TypeScript. Zero dependencies.
 *
 * Local, offline, non-clinical detection of potential crisis patterns.
 * Does NOT claim to diagnose or provide emergency response.
 * The system is a behavioral aid — not a medical device.
 *
 * Detection is purely pattern-based (state + signal duration + override history).
 * If AI is available, core calls AIAdvisor port and merges signals.
 */

import type { BehavioralState } from "../behavioral/state-machine.js";

export interface CrisisSignal {
  /** True if local pattern logic alone suggests elevated concern. */
  localElevated: boolean;
  /** If AI returned a corroborating signal. Null = AI unavailable. */
  aiCorroborated: boolean | null;
  /** Duration spent in ACUTE or CRISIS_ADJACENT states, in ms. */
  acuteDurationMs: number;
  /** Number of consecutive override attempts at FIRM_GATE or above. */
  consecutiveOverrides: number;
}

export interface CrisisAssessment {
  level: "NONE" | "WATCH" | "ALERT";
  reason: string;
}

/**
 * Evaluate crisis signal. Returns a non-clinical assessment for gate escalation.
 * Does not contact external services. Does not claim clinical validity.
 */
export function evaluateCrisisSignal(
  state: BehavioralState,
  signal: CrisisSignal
): CrisisAssessment {
  if (state === "CRISIS_ADJACENT") {
    if (signal.acuteDurationMs > 30 * 60 * 1000) {
      // 30+ minutes in crisis-adjacent with optional AI corroboration
      return {
        level: "ALERT",
        reason: "Extended time in highest local state.",
      };
    }
    return { level: "WATCH", reason: "Crisis-adjacent state detected locally." };
  }

  if (state === "ACUTE" && signal.consecutiveOverrides >= 3) {
    return {
      level: "WATCH",
      reason: "Acute state with repeated override attempts.",
    };
  }

  return { level: "NONE", reason: "No crisis pattern detected." };
}
