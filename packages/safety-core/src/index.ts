/**
 * @uicare-hui/safety-core
 * Public API surface.
 *
 * Only export from this file. Do not import internal modules directly
 * from outside packages/safety-core.
 *
 * INVARIANT_011: This package has zero runtime dependencies.
 */

// ---- Ports ----------------------------------------------------------------
export type { Clock } from "./ports/Clock.js";
export type { BehavioralSignal, SignalCollector } from "./ports/SignalCollector.js";
export type { ConsentStatus, ConsentRecord, ConsentStore } from "./ports/ConsentStore.js";
export type { InterventionLevel, InterventionRequest, InterventionDisplay } from "./ports/InterventionDisplay.js";
export type { AuditEventType, AuditEvent, AuditLogger } from "./ports/AuditLogger.js";
export type { DataLifecycle } from "./ports/DataLifecycle.js";
export type { AIAdvisoryRequest, AIAdvisoryResponse, AIAdvisor } from "./ports/AIAdvisor.js";
export { NULL_AI_ADVISOR } from "./ports/AIAdvisor.js";

// ---- Behavioral -----------------------------------------------------------
export type { BehavioralState, StateTransitionResult } from "./behavioral/state-machine.js";
export { transitionState, isColdStart, COLD_START_OBSERVATION_WINDOW_MS } from "./behavioral/state-machine.js";

export type { WearableBaseline } from "./behavioral/risk-scorer.js";
export { computeRiskScore, updateBaseline } from "./behavioral/risk-scorer.js";

export { evaluateColdStart } from "./behavioral/cold-start-policy.js";
export type { ColdStartStatus } from "./behavioral/cold-start-policy.js";

export type { FeedbackCategory, FeedbackEvent } from "./behavioral/feedback-classifier.js";
export { classifyFeedback } from "./behavioral/feedback-classifier.js";

export type { BaselineSnapshot } from "./behavioral/baseline-manager.js";
export { createEmptySnapshot, ingestSignal } from "./behavioral/baseline-manager.js";

// ---- Safety ---------------------------------------------------------------
export type { GateDecision, GateInput, GateResult } from "./safety/action-gate.js";
export { evaluateGate } from "./safety/action-gate.js";

export type { OverrideRequest, OverrideResult } from "./safety/override-policy.js";
export { evaluateOverride } from "./safety/override-policy.js";

export { buildIntervention } from "./safety/intervention.js";

export type { AgencyRecord, AgencyAssessment } from "./safety/agency-preservation.js";
export { assessAgency } from "./safety/agency-preservation.js";

export type { CrisisSignal, CrisisAssessment } from "./safety/crisis-detector.js";
export { evaluateCrisisSignal } from "./safety/crisis-detector.js";

// ---- Consent --------------------------------------------------------------
export type { ConsentCheckResult } from "./consent/consent-enforcer.js";
export { checkConsent, applyRevocation } from "./consent/consent-enforcer.js";

export type { ValidationResult } from "./consent/consent-validator.js";
export { validateConsentRecord } from "./consent/consent-validator.js";

// ---- Invariants -----------------------------------------------------------
export {
  assertMonitoringRequiresConsent,
  assertProtectedActionAllowed,
  assertHardBlockNoOverride,
  assertValidState,
  assertRiskScoreRange,
  assertGatesIndependentOfAI,
  assertRevocationHonored,
  assertNoClinicalLanguage,
  assertColdStartGatesSuppressed,
  assertAuditLogCoverage_STRUCTURAL_MARKER,
  assertSafetyCoreHasZeroRuntimeDeps_STRUCTURAL_MARKER,
} from "./invariants.js";
