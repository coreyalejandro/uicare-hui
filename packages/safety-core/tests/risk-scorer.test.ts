import { describe, it, expect } from "vitest";
import { computeRiskScore, updateBaseline } from "../src/behavioral/risk-scorer";
import type { BehavioralSignal } from "../src/ports/SignalCollector";
import type { WearableBaseline } from "../src/behavioral/risk-scorer";

const baseSignal: BehavioralSignal = {
  heartRateDelta: 0.1,
  sleepDeficitDelta: 0.1,
  activityDelta: 0.1,
  textVolumeRecent: 500,
  collectedAtMs: 1000,
};

describe("risk-scorer", () => {
  describe("computeRiskScore", () => {
    it("returns 0 with null baseline (cold start)", () => {
      expect(computeRiskScore(baseSignal, null)).toBe(0);
    });

    it("returns 0 with insufficient sample count", () => {
      const b: WearableBaseline = {
        heartRateDelta: 0.1, sleepDeficitDelta: 0.1, activityDelta: 0.1,
        sampleCount: 2
      };
      expect(computeRiskScore(baseSignal, b)).toBe(0);
    });

    it("returns positive score when signal exceeds baseline", () => {
      const b: WearableBaseline = {
        heartRateDelta: 0.0, sleepDeficitDelta: 0.0, activityDelta: 0.0,
        sampleCount: 5
      };
      const signal: BehavioralSignal = {
        ...baseSignal,
        heartRateDelta: 0.5, sleepDeficitDelta: 0.5, activityDelta: 0.5,
      };
      const score = computeRiskScore(signal, b);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it("caps at 1.0", () => {
      const b: WearableBaseline = {
        heartRateDelta: 0, sleepDeficitDelta: 0, activityDelta: 0,
        sampleCount: 10
      };
      const signal: BehavioralSignal = {
        heartRateDelta: 100, sleepDeficitDelta: 100, activityDelta: 100,
        textVolumeRecent: 999999, collectedAtMs: 1000,
      };
      expect(computeRiskScore(signal, b)).toBe(1.0);
    });

    it("is not negative when signal is below baseline", () => {
      const b: WearableBaseline = {
        heartRateDelta: 0.8, sleepDeficitDelta: 0.8, activityDelta: 0.8,
        sampleCount: 5
      };
      const score = computeRiskScore(baseSignal, b);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe("updateBaseline", () => {
    it("initializes from null baseline", () => {
      const b = updateBaseline(null, baseSignal);
      expect(b.sampleCount).toBe(1);
      expect(b.heartRateDelta).toBe(0.1);
    });

    it("converges over multiple samples", () => {
      let b = updateBaseline(null, { ...baseSignal, heartRateDelta: 0.0 });
      b = updateBaseline(b, { ...baseSignal, heartRateDelta: 1.0 });
      // After 2 samples, moving average should be between 0 and 1
      expect(b.heartRateDelta).toBeGreaterThan(0);
      expect(b.heartRateDelta).toBeLessThan(1);
      expect(b.sampleCount).toBe(2);
    });
  });
});
