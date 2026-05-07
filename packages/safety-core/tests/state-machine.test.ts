import { describe, it, expect } from "vitest";
import {
  transitionState,
  isColdStart,
  COLD_START_OBSERVATION_WINDOW_MS,
} from "../src/behavioral/state-machine";

describe("state-machine", () => {
  describe("transitionState", () => {
    it("stays BASELINE at score 0", () => {
      const r = transitionState("BASELINE", 0, 1000);
      expect(r.nextState).toBe("BASELINE");
      expect(r.transitioned).toBe(false);
    });

    it("transitions BASELINE -> ELEVATED at 0.25", () => {
      const r = transitionState("BASELINE", 0.25, 1000);
      expect(r.nextState).toBe("ELEVATED");
      expect(r.transitioned).toBe(true);
    });

    it("transitions to HEIGHTENED at 0.50", () => {
      const r = transitionState("BASELINE", 0.50, 1000);
      expect(r.nextState).toBe("HEIGHTENED");
    });

    it("transitions to ACUTE at 0.70", () => {
      const r = transitionState("BASELINE", 0.70, 1000);
      expect(r.nextState).toBe("ACUTE");
    });

    it("transitions to CRISIS_ADJACENT at 0.85", () => {
      const r = transitionState("BASELINE", 0.85, 1000);
      expect(r.nextState).toBe("CRISIS_ADJACENT");
    });

    it("applies hysteresis on downward transition", () => {
      // At ELEVATED (threshold 0.25), a score of 0.22 is within hysteresis (0.08)
      // so it stays ELEVATED. Score must drop below 0.17 to transition down.
      const r1 = transitionState("ELEVATED", 0.22, 1000);
      expect(r1.nextState).toBe("ELEVATED");

      const r2 = transitionState("ELEVATED", 0.16, 1000);
      expect(r2.nextState).toBe("BASELINE");
    });

    it("steps down one state at a time from CRISIS_ADJACENT", () => {
      const r = transitionState("CRISIS_ADJACENT", 0.10, 1000);
      expect(r.nextState).toBe("ACUTE");
    });

    it("includes timestamp in result", () => {
      const r = transitionState("BASELINE", 0, 9999);
      expect(r.timestampMs).toBe(9999);
    });
  });

  describe("isColdStart", () => {
    it("returns true within observation window", () => {
      expect(isColdStart(0, COLD_START_OBSERVATION_WINDOW_MS - 1)).toBe(true);
    });

    it("returns false after observation window", () => {
      expect(isColdStart(0, COLD_START_OBSERVATION_WINDOW_MS)).toBe(false);
    });
  });
});
