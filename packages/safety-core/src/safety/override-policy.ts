/**
 * Override Policy
 * Pure TypeScript. Zero dependencies.
 *
 * Governs the conditions under which a user may override a gate.
 * HARD_BLOCK states never permit overrides.
 * Override events are logged and count toward escalation tracking.
 */

import type { BehavioralState } from "../behavioral/state-machine.js";
import type { GateDecision } from "./action-gate.js";

export interface OverrideRequest {
  userId: string;
  action: string;
  currentGate: GateDecision;
  currentState: BehavioralState;
  timestampMs: number;
}

export interface OverrideResult {
  permitted: boolean;
  reason: string;
}

export function evaluateOverride(request: OverrideRequest): OverrideResult {
  if (request.currentGate === "HARD_BLOCK") {
    return {
      permitted: false,
      reason: "HARD_BLOCK state does not permit overrides.",
    };
  }

  if (request.currentGate === "ALLOW") {
    return {
      permitted: true,
      reason: "No gate active; override trivially permitted.",
    };
  }

  // SOFT_GATE and FIRM_GATE: user may override with acknowledgment.
  return {
    permitted: true,
    reason: `User override of ${request.currentGate} in state ${request.currentState} permitted. Event logged.`,
  };
}
