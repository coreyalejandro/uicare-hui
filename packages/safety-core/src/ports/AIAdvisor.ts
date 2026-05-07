/**
 * PORT: AIAdvisor
 * Optional secondary port. Core can request an advisory signal from an AI.
 * The adapter implements this against Azure OpenAI or any LLM.
 * If the adapter returns null (unavailable/degraded), core MUST operate
 * using local-only logic. AI failure must never disable local gates.
 * INVARIANT_011: No HTTP/fetch/OpenAI SDK in core.
 */
export interface AIAdvisoryRequest {
  /** Anonymized text content to analyze. No PII. */
  contentSample: string;
  /** Current state context. */
  behavioralStateLabel: string;
  /** Risk score from local logic, for AI to optionally corroborate. */
  localRiskScore: number;
}

export interface AIAdvisoryResponse {
  /** Optional corroborating signal 0–1. Null = AI unavailable. */
  advisoryScore: number | null;
  /** Whether AI detected a loop pattern. */
  loopDetected: boolean | null;
  /** Human-readable rationale (never shown to user directly). */
  rationale: string | null;
}

export interface AIAdvisor {
  /** Returns null adapter response if AI is unavailable — never throws. */
  advise(request: AIAdvisoryRequest): Promise<AIAdvisoryResponse>;
}

/** Null adapter: used when AI is unavailable. Core passes this in tests. */
export const NULL_AI_ADVISOR: AIAdvisor = {
  async advise(_request: AIAdvisoryRequest): Promise<AIAdvisoryResponse> {
    return { advisoryScore: null, loopDetected: null, rationale: null };
  }
};
