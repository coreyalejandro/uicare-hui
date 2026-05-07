import { describe, it, expect } from "vitest";
import { evaluateGate } from "../src/safety/action-gate";
import type { GateInput } from "../src/safety/action-gate";
import type { ConsentRecord } from "../src/ports/ConsentStore";

const grantedConsent: ConsentRecord = {
  userId: "user1",
  feature: "behavioral_monitoring",
  status: "GRANTED",
  grantedAtMs: 1000,
  revokedAtMs: null,
  version: 1,
};

const baseInput: GateInput = {
  action: "submit_post",
  isProtectedAction: false,
  behavioralState: "BASELINE",
  consentRecords: [grantedConsent],
  coldStartActive: false,
};

describe("action-gate", () => {
  it("ALLOW in BASELINE state", () => {
    const r = evaluateGate(baseInput);
    expect(r.decision).toBe("ALLOW");
  });

  it("SOFT_GATE in ELEVATED state", () => {
    const r = evaluateGate({ ...baseInput, behavioralState: "ELEVATED" });
    expect(r.decision).toBe("SOFT_GATE");
    expect(r.interventionLevel).toBe("SOFT");
    expect(r.overrideAvailable).toBe(true);
  });

  it("FIRM_GATE in HEIGHTENED state", () => {
    const r = evaluateGate({ ...baseInput, behavioralState: "HEIGHTENED" });
    expect(r.decision).toBe("FIRM_GATE");
    expect(r.interventionLevel).toBe("FIRM");
  });

  it("FIRM_GATE in ACUTE state", () => {
    const r = evaluateGate({ ...baseInput, behavioralState: "ACUTE" });
    expect(r.decision).toBe("FIRM_GATE");
  });

  it("HARD_BLOCK in CRISIS_ADJACENT state", () => {
    const r = evaluateGate({ ...baseInput, behavioralState: "CRISIS_ADJACENT" });
    expect(r.decision).toBe("HARD_BLOCK");
    expect(r.overrideAvailable).toBe(false);
    expect(r.interventionLevel).toBe("HARD_BLOCK");
  });

  it("ALLOW for protected action regardless of state", () => {
    const r = evaluateGate({
      ...baseInput,
      isProtectedAction: true,
      behavioralState: "CRISIS_ADJACENT",
    });
    expect(r.decision).toBe("ALLOW");
  });

  it("ALLOW during cold start", () => {
    const r = evaluateGate({
      ...baseInput,
      coldStartActive: true,
      behavioralState: "CRISIS_ADJACENT",
    });
    expect(r.decision).toBe("ALLOW");
  });

  it("ALLOW when consent not granted", () => {
    const r = evaluateGate({
      ...baseInput,
      consentRecords: [],
      behavioralState: "CRISIS_ADJACENT",
    });
    expect(r.decision).toBe("ALLOW");
  });

  it("ALLOW when consent REVOKED", () => {
    const revoked: ConsentRecord = { ...grantedConsent, status: "REVOKED", revokedAtMs: 2000 };
    const r = evaluateGate({
      ...baseInput,
      consentRecords: [revoked],
      behavioralState: "CRISIS_ADJACENT",
    });
    expect(r.decision).toBe("ALLOW");
  });
});
