/**
 * Action Gate
 * Pure TypeScript. Zero dependencies.
 *
 * Determines whether a user action should be gated based on
 * current behavioral state and consent status.
 *
 * NEVER blocks an emergency exit or accessibility feature.
 * Gate decisions are deterministic given inputs.
 */

import type { BehavioralState } from "../behavioral/state-machine.js";
import type { ConsentRecord } from "../ports/ConsentStore.js";
import type { InterventionLevel } from "../ports/InterventionDisplay.js";

export type GateDecision = "ALLOW" | "SOFT_GATE" | "FIRM_GATE" | "HARD_BLOCK";

export interface GateInput {
  action: string;
  /** True if this action is an emergency exit, accessibility control, or consent flow. */
  isProtectedAction: boolean;
  behavioralState: BehavioralState;
  consentRecords: ConsentRecord[];
  coldStartActive: boolean;
}

export interface GateResult {
  decision: GateDecision;
  reason: string;
  interventionLevel: InterventionLevel | null;
  /** Override available at this gate level. HARD_BLOCK never allows override. */
  overrideAvailable: boolean;
}

/** Map from state to the gate level it imposes. */
const STATE_GATE_MAP: Record<BehavioralState, GateDecision> = {
  BASELINE:        "ALLOW",
  ELEVATED:        "SOFT_GATE",
  HEIGHTENED:      "FIRM_GATE",
  ACUTE:           "FIRM_GATE",
  CRISIS_ADJACENT: "HARD_BLOCK",
};

const GATE_TO_INTERVENTION: Partial<Record<GateDecision, InterventionLevel>> = {
  SOFT_GATE:   "SOFT",
  FIRM_GATE:   "FIRM",
  HARD_BLOCK:  "HARD_BLOCK",
};

export function evaluateGate(input: GateInput): GateResult {
  // Rule 1: Protected actions are always allowed regardless of state.
  if (input.isProtectedAction) {
    return {
      decision: "ALLOW",
      reason: "Protected action (emergency/accessibility/consent) always passes.",
      interventionLevel: null,
      overrideAvailable: false,
    };
  }

  // Rule 2: During cold start, gates are suppressed (observation window active).
  if (input.coldStartActive) {
    return {
      decision: "ALLOW",
      reason: "Cold start observation window active. Gates suppressed.",
      interventionLevel: null,
      overrideAvailable: false,
    };
  }

  // Rule 3: Consent must be granted for monitoring. If not, gates do not fire.
  const monitoringConsent = input.consentRecords.find(
    r => r.feature === "behavioral_monitoring"
  );
  if (!monitoringConsent || monitoringConsent.status !== "GRANTED") {
    return {
      decision: "ALLOW",
      reason: "Behavioral monitoring consent not granted. No gate applied.",
      interventionLevel: null,
      overrideAvailable: false,
    };
  }

  // Rule 4: Apply state-based gate decision.
  const decision = STATE_GATE_MAP[input.behavioralState];
  const interventionLevel = GATE_TO_INTERVENTION[decision] ?? null;

  return {
    decision,
    reason: `State ${input.behavioralState} maps to ${decision}.`,
    interventionLevel,
    overrideAvailable: decision === "SOFT_GATE" || decision === "FIRM_GATE",
  };
}
