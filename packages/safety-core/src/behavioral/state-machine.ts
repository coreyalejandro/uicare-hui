/**
 * Behavioral State Machine
 * Pure TypeScript. Zero dependencies. No browser/Node APIs.
 *
 * States represent the user's observed behavioral level.
 * Transitions are deterministic: given state + risk score => next state.
 * No side effects. Callers must inject Clock and AuditLogger via ports.
 */

export type BehavioralState =
  | "BASELINE"      // Within normal parameters
  | "ELEVATED"      // Mild deviation from baseline
  | "HEIGHTENED"    // Significant deviation, soft gates active
  | "ACUTE"         // High deviation, firm gates active
  | "CRISIS_ADJACENT"; // Maximum local detection, hard block active

export interface StateTransitionResult {
  previousState: BehavioralState;
  nextState: BehavioralState;
  transitioned: boolean;
  riskScore: number;
  timestampMs: number;
  reason: string;
}

// Thresholds for upward transitions
const THRESHOLDS: Record<BehavioralState, number> = {
  BASELINE: 0.0,
  ELEVATED: 0.25,
  HEIGHTENED: 0.50,
  ACUTE: 0.70,
  CRISIS_ADJACENT: 0.85,
};

// Cooldown factor: downward transitions require risk to drop further than upward
const HYSTERESIS = 0.08;

function stateFromScore(score: number, current: BehavioralState): BehavioralState {
  // Upward transitions use standard thresholds
  if (score >= THRESHOLDS.CRISIS_ADJACENT) return "CRISIS_ADJACENT";
  if (score >= THRESHOLDS.ACUTE) return "ACUTE";
  if (score >= THRESHOLDS.HEIGHTENED) return "HEIGHTENED";
  if (score >= THRESHOLDS.ELEVATED) return "ELEVATED";

  // Downward transitions use hysteresis to prevent flapping
  const currentThreshold = THRESHOLDS[current];
  if (score < currentThreshold - HYSTERESIS) {
    // Step down one state at a time for gradual de-escalation
    const order: BehavioralState[] = [
      "BASELINE", "ELEVATED", "HEIGHTENED", "ACUTE", "CRISIS_ADJACENT"
    ];
    const idx = order.indexOf(current);
    return idx > 0 ? (order[idx - 1] as BehavioralState) : "BASELINE";
  }

  return current;
}

export function transitionState(
  current: BehavioralState,
  riskScore: number,
  timestampMs: number
): StateTransitionResult {
  const next = stateFromScore(riskScore, current);
  return {
    previousState: current,
    nextState: next,
    transitioned: next !== current,
    riskScore,
    timestampMs,
    reason: next !== current
      ? `Risk ${riskScore.toFixed(3)} caused ${current} -> ${next}`
      : `Risk ${riskScore.toFixed(3)} stable in ${current}`,
  };
}

/**
 * Cold-start policy: when no baseline exists, state begins at BASELINE
 * with a mandatory observation window before gates activate.
 */
export const COLD_START_OBSERVATION_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export function isColdStart(firstSignalMs: number, nowMs: number): boolean {
  return nowMs - firstSignalMs < COLD_START_OBSERVATION_WINDOW_MS;
}
