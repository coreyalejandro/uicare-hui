/**
 * PORT: InterventionDisplay
 * Primary port. Core logic calls this when a safety intervention must be shown.
 * The adapter (React component / screen reader) implements the presentation.
 * INVARIANT_011: No DOM or React APIs in core.
 */
export type InterventionLevel = "SOFT" | "FIRM" | "HARD_BLOCK";

export interface InterventionRequest {
  level: InterventionLevel;
  /** Non-clinical user-facing message. Max 200 chars. */
  message: string;
  /** Optional: label for the grounding action button. */
  actionLabel?: string;
  /** If true, the gate blocks the triggering action until dismissed. */
  blockingAction: boolean;
  /** Unique ID for deduplication and audit. */
  interventionId: string;
  /** Timestamp from Clock port at time of decision. */
  decidedAtMs: number;
}

export interface InterventionDisplay {
  /** Show an intervention to the user. Returns when user dismisses or action taken. */
  show(request: InterventionRequest): Promise<void>;
  /** Dismiss any currently displayed intervention. */
  dismiss(interventionId: string): Promise<void>;
}
