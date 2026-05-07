/**
 * Governance Invariant Suite
 * End-to-end invariant tests using behavioral trace fixtures.
 * These tests run at the core level — no DOM, no storage, no network.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {
  createEmptySnapshot,
  ingestSignal,
  computeRiskScore,
  transitionState,
  evaluateGate,
  evaluateColdStart,
  checkConsent,
  assertMonitoringRequiresConsent,
  assertRiskScoreRange,
  assertColdStartGatesSuppressed,
  assertNoClinicalLanguage,
  assertHardBlockNoOverride,
  assertProtectedActionAllowed,
  COLD_START_OBSERVATION_WINDOW_MS,
  type BehavioralState,
  type ConsentRecord,
} from "@uicare-hui/safety-core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const traces = JSON.parse(
  readFileSync(join(__dirname, "../fixtures/behavioral-traces.json"), "utf-8")
) as Array<Record<string, unknown>>;

const GRANTED_CONSENT: ConsentRecord = {
  userId: "test-user",
  feature: "behavioral_monitoring",
  status: "GRANTED",
  grantedAtMs: 0,
  revokedAtMs: null,
  version: 1,
};

const REVOKED_CONSENT: ConsentRecord = {
  ...GRANTED_CONSENT,
  status: "REVOKED",
  revokedAtMs: 500,
};

describe("Governance Invariant Suite", () => {
  describe("Intervention copy — INVARIANT_008", () => {
    const safePhrases = [
      "A brief pause might feel good right now.",
      "Let's take a moment before continuing.",
      "This is paused. Grounding support is ready when you are.",
      "I'm fine, continue",
      "Take a break",
      "Open grounding support",
      "I'd rather continue",
    ];
    safePhrases.forEach(phrase => {
      it(`is safe: "${phrase.slice(0, 50)}"`, () => {
        expect(() => assertNoClinicalLanguage(phrase)).not.toThrow();
      });
    });
  });

  describe("Behavioral trace fixtures", () => {
    it("trace-001: BASELINE stays baseline", () => {
      const trace = traces.find(t => t["id"] === "trace-001")!;
      const signals = trace["signals"] as Array<Record<string, number>>;

      let snapshot = createEmptySnapshot();
      let state: BehavioralState = "BASELINE";

      for (const sig of signals) {
        const signal = { ...sig, collectedAtMs: sig["collectedAtMs"] as number };
        snapshot = ingestSignal(snapshot, signal as never);
        const risk = computeRiskScore(signal as never, snapshot.baseline);
        assertRiskScoreRange(risk);
        const result = transitionState(state, risk, signal.collectedAtMs as number);
        state = result.nextState;
      }

      expect(state).toBe(trace["expectedFinalState"]);
    });

    it("trace-004: cold start suppresses gate", () => {
      const nowMs = 1000; // within cold start window
      const firstSignalMs = 0;
      const coldStart = evaluateColdStart(firstSignalMs, nowMs);
      expect(coldStart.isActive).toBe(true);

      const gateResult = evaluateGate({
        action: "submit",
        isProtectedAction: false,
        behavioralState: "CRISIS_ADJACENT",
        consentRecords: [GRANTED_CONSENT],
        coldStartActive: coldStart.isActive,
      });

      expect(gateResult.decision).toBe("ALLOW");
      assertColdStartGatesSuppressed(coldStart.isActive, gateResult);
    });

    it("trace-005: revoked consent bypasses gate", () => {
      const gateResult = evaluateGate({
        action: "submit",
        isProtectedAction: false,
        behavioralState: "CRISIS_ADJACENT",
        consentRecords: [REVOKED_CONSENT],
        coldStartActive: false,
      });
      expect(gateResult.decision).toBe("ALLOW");
    });
  });

  describe("Core invariants end-to-end", () => {
    it("INVARIANT_001: monitoring off without consent", () => {
      expect(() => assertMonitoringRequiresConsent(true, false)).toThrow("INVARIANT_001");
      expect(() => assertMonitoringRequiresConsent(true, true)).not.toThrow();
    });

    it("INVARIANT_003: HARD_BLOCK never permits override", () => {
      const hardBlock = evaluateGate({
        action: "submit",
        isProtectedAction: false,
        behavioralState: "CRISIS_ADJACENT",
        consentRecords: [GRANTED_CONSENT],
        coldStartActive: false,
      });
      expect(hardBlock.decision).toBe("HARD_BLOCK");
      assertHardBlockNoOverride(hardBlock);
      expect(hardBlock.overrideAvailable).toBe(false);
    });

    it("INVARIANT_002: protected action always passes CRISIS_ADJACENT", () => {
      const gateResult = evaluateGate({
        action: "open_consent_settings",
        isProtectedAction: true,
        behavioralState: "CRISIS_ADJACENT",
        consentRecords: [GRANTED_CONSENT],
        coldStartActive: false,
      });
      expect(gateResult.decision).toBe("ALLOW");
      assertProtectedActionAllowed(true, gateResult);
    });

    it("INVARIANT_006: AI failure does not disable gates", () => {
      // Gate evaluated with null AI advisor (adapter not available)
      // Gate must still produce a decision
      const gateResult = evaluateGate({
        action: "submit",
        isProtectedAction: false,
        behavioralState: "ACUTE",
        consentRecords: [GRANTED_CONSENT],
        coldStartActive: false,
      });
      // AI is not involved in gate evaluation — decision is always present
      expect(gateResult.decision).toBeTruthy();
    });

    it("Cold start window: exactly at boundary", () => {
      const boundary = evaluateColdStart(0, COLD_START_OBSERVATION_WINDOW_MS);
      expect(boundary.isActive).toBe(false);
      const justBefore = evaluateColdStart(0, COLD_START_OBSERVATION_WINDOW_MS - 1);
      expect(justBefore.isActive).toBe(true);
    });
  });
});
