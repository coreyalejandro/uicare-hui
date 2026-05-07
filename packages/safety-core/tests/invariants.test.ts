import { describe, it, expect } from "vitest";
import {
  assertMonitoringRequiresConsent,
  assertProtectedActionAllowed,
  assertHardBlockNoOverride,
  assertValidState,
  assertRiskScoreRange,
  assertGatesIndependentOfAI,
  assertNoClinicalLanguage,
  assertColdStartGatesSuppressed,
} from "../src/invariants";
import type { GateResult } from "../src/safety/action-gate";

const allowResult: GateResult = {
  decision: "ALLOW", reason: "ok", interventionLevel: null, overrideAvailable: false,
};
const hardBlockResult: GateResult = {
  decision: "HARD_BLOCK", reason: "blocked", interventionLevel: "HARD_BLOCK", overrideAvailable: false,
};
const hardBlockBroken: GateResult = {
  ...hardBlockResult, overrideAvailable: true,
};

describe("invariants", () => {
  describe("INVARIANT_001: monitoring requires consent", () => {
    it("passes when monitoring off", () => {
      expect(() => assertMonitoringRequiresConsent(false, false)).not.toThrow();
    });
    it("passes when monitoring on and consent granted", () => {
      expect(() => assertMonitoringRequiresConsent(true, true)).not.toThrow();
    });
    it("throws when monitoring on without consent", () => {
      expect(() => assertMonitoringRequiresConsent(true, false))
        .toThrow("INVARIANT_001");
    });
  });

  describe("INVARIANT_002: protected actions always pass gate", () => {
    it("passes for protected + ALLOW", () => {
      expect(() => assertProtectedActionAllowed(true, allowResult)).not.toThrow();
    });
    it("throws for protected + HARD_BLOCK", () => {
      expect(() => assertProtectedActionAllowed(true, hardBlockResult))
        .toThrow("INVARIANT_002");
    });
    it("passes for non-protected + HARD_BLOCK (gate on non-protected is valid)", () => {
      expect(() => assertProtectedActionAllowed(false, hardBlockResult)).not.toThrow();
    });
  });

  describe("INVARIANT_003: HARD_BLOCK has no override", () => {
    it("passes for HARD_BLOCK with no override", () => {
      expect(() => assertHardBlockNoOverride(hardBlockResult)).not.toThrow();
    });
    it("throws when HARD_BLOCK allows override", () => {
      expect(() => assertHardBlockNoOverride(hardBlockBroken))
        .toThrow("INVARIANT_003");
    });
    it("passes for non-HARD_BLOCK with override", () => {
      const softGate: GateResult = {
        decision: "SOFT_GATE", reason: "", interventionLevel: "SOFT", overrideAvailable: true,
      };
      expect(() => assertHardBlockNoOverride(softGate)).not.toThrow();
    });
  });

  describe("INVARIANT_004: valid state set", () => {
    it("accepts all valid states", () => {
      const states = ["BASELINE", "ELEVATED", "HEIGHTENED", "ACUTE", "CRISIS_ADJACENT"] as const;
      states.forEach(s => expect(() => assertValidState(s)).not.toThrow());
    });
    it("throws on unknown state", () => {
      expect(() => assertValidState("UNKNOWN" as any)).toThrow("INVARIANT_004");
    });
  });

  describe("INVARIANT_005: risk score in [0,1]", () => {
    it("accepts 0, 0.5, 1", () => {
      [0, 0.5, 1].forEach(s => expect(() => assertRiskScoreRange(s)).not.toThrow());
    });
    it("throws on negative", () => {
      expect(() => assertRiskScoreRange(-0.01)).toThrow("INVARIANT_005");
    });
    it("throws on > 1", () => {
      expect(() => assertRiskScoreRange(1.01)).toThrow("INVARIANT_005");
    });
    it("throws on NaN", () => {
      expect(() => assertRiskScoreRange(NaN)).toThrow("INVARIANT_005");
    });
  });

  describe("INVARIANT_006: AI failure does not disable gates", () => {
    it("passes when AI unavailable but gate has decision", () => {
      expect(() => assertGatesIndependentOfAI(hardBlockResult, false)).not.toThrow();
    });
    it("throws when AI unavailable and decision is empty string", () => {
      const broken = { ...hardBlockResult, decision: "" as any };
      expect(() => assertGatesIndependentOfAI(broken, false)).toThrow("INVARIANT_006");
    });
  });

  describe("INVARIANT_008: no clinical language in messages", () => {
    it("passes for safe messages", () => {
      expect(() => assertNoClinicalLanguage("A moment to breathe might help.")).not.toThrow();
    });
    it("throws on clinical term 'diagnosis'", () => {
      expect(() => assertNoClinicalLanguage("This suggests a diagnosis")).toThrow("INVARIANT_008");
    });
    it("throws on 'emergency'", () => {
      expect(() => assertNoClinicalLanguage("This is an emergency")).toThrow("INVARIANT_008");
    });
    it("throws on 'mania'", () => {
      expect(() => assertNoClinicalLanguage("Signs of mania detected")).toThrow("INVARIANT_008");
    });
  });

  describe("INVARIANT_009: cold start suppresses gates", () => {
    it("passes when cold start and ALLOW", () => {
      expect(() => assertColdStartGatesSuppressed(true, allowResult)).not.toThrow();
    });
    it("throws when cold start but HARD_BLOCK fires", () => {
      expect(() => assertColdStartGatesSuppressed(true, hardBlockResult))
        .toThrow("INVARIANT_009");
    });
    it("passes when not cold start and HARD_BLOCK fires", () => {
      expect(() => assertColdStartGatesSuppressed(false, hardBlockResult)).not.toThrow();
    });
  });
});
