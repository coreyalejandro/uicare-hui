/**
 * Intervention Builder
 * Pure TypeScript. Zero dependencies.
 *
 * Constructs InterventionRequest objects for the InterventionDisplay port.
 * All user-facing copy is non-clinical and agency-preserving.
 * No diagnosis language, no emergency response claims.
 */

import type { InterventionRequest, InterventionLevel } from "../ports/InterventionDisplay.js";
import type { BehavioralState } from "../behavioral/state-machine.js";

let interventionCounter = 0;

function generateId(prefix: string): string {
  interventionCounter += 1;
  return `${prefix}-${interventionCounter}`;
}

// Non-clinical, non-alarming user-facing messages
const MESSAGES: Record<BehavioralState, Record<InterventionLevel, string>> = {
  ELEVATED: {
    SOFT: "A quick pause might feel good right now. Want to take a moment?",
    FIRM: "Notice how you're feeling. A brief break is available.",
    HARD_BLOCK: "", // Not reached from ELEVATED
  },
  HEIGHTENED: {
    SOFT: "You seem like you might benefit from a short break.",
    FIRM: "Let's pause here. A grounding moment is ready when you are.",
    HARD_BLOCK: "",
  },
  ACUTE: {
    SOFT: "Taking a few minutes to breathe can help right now.",
    FIRM: "A break is strongly recommended. You can return to this shortly.",
    HARD_BLOCK: "This action is paused. A support moment is available.",
  },
  CRISIS_ADJACENT: {
    SOFT: "",
    FIRM: "",
    HARD_BLOCK: "This is paused for now. Grounding support is ready.",
  },
  BASELINE: {
    SOFT: "",
    FIRM: "",
    HARD_BLOCK: "",
  },
};

const ACTION_LABELS: Record<InterventionLevel, string> = {
  SOFT: "I'm good, continue",
  FIRM: "Take a break",
  HARD_BLOCK: "Open grounding support",
};

export function buildIntervention(
  state: BehavioralState,
  level: InterventionLevel,
  decidedAtMs: number
): InterventionRequest {
  const message = MESSAGES[state]?.[level] ?? "A moment of pause is available.";
  return {
    level,
    message,
    actionLabel: ACTION_LABELS[level],
    blockingAction: level === "HARD_BLOCK",
    interventionId: generateId(`intv-${level.toLowerCase()}`),
    decidedAtMs,
  };
}
