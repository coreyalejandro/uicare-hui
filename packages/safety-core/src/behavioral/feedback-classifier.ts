/**
 * Feedback Classifier
 * Pure TypeScript. Zero dependencies.
 *
 * Classifies user feedback signals into behavioral categories.
 * Used as an additional signal layer alongside wearable metrics.
 */

export type FeedbackCategory =
  | "GROUNDING_EFFECTIVE"  // User said grounding exercise helped
  | "GROUNDING_REJECTED"   // User dismissed grounding without engaging
  | "OVERRIDE_REQUESTED"   // User requested a gate override
  | "OVERRIDE_USED"        // User actually used the override
  | "CALM_REPORTED"        // User self-reported calm state
  | "DISTRESS_REPORTED";   // User self-reported distress

export interface FeedbackEvent {
  category: FeedbackCategory;
  timestampMs: number;
  userId: string;
}

/**
 * Compute a feedback adjustment (-0.10 to +0.10) to apply to the risk score.
 * Positive means elevate; negative means de-escalate.
 */
export function classifyFeedback(event: FeedbackEvent): number {
  switch (event.category) {
    case "GROUNDING_EFFECTIVE": return -0.08;
    case "CALM_REPORTED":       return -0.10;
    case "GROUNDING_REJECTED":  return +0.03;
    case "OVERRIDE_REQUESTED":  return +0.05;
    case "OVERRIDE_USED":       return +0.08;
    case "DISTRESS_REPORTED":   return +0.10;
    default:
      // Exhaustive: TypeScript will catch missing cases at compile time
      return 0;
  }
}
