import { describe, it, expect } from "vitest";
import { checkConsent, applyRevocation } from "../src/consent/consent-enforcer";
import type { ConsentRecord } from "../src/ports/ConsentStore";

const grantedRecord: ConsentRecord = {
  userId: "user1",
  feature: "behavioral_monitoring",
  status: "GRANTED",
  grantedAtMs: 1000,
  revokedAtMs: null,
  version: 1,
};

describe("consent-enforcer", () => {
  it("returns allowed for GRANTED consent", () => {
    const r = checkConsent([grantedRecord], "user1", "behavioral_monitoring");
    expect(r.allowed).toBe(true);
    expect(r.status).toBe("GRANTED");
  });

  it("returns denied for missing record", () => {
    const r = checkConsent([], "user1", "behavioral_monitoring");
    expect(r.allowed).toBe(false);
    expect(r.status).toBe("NOT_FOUND");
  });

  it("returns denied for REVOKED consent", () => {
    const revoked: ConsentRecord = { ...grantedRecord, status: "REVOKED", revokedAtMs: 2000 };
    const r = checkConsent([revoked], "user1", "behavioral_monitoring");
    expect(r.allowed).toBe(false);
    expect(r.status).toBe("REVOKED");
  });

  it("returns denied for PENDING consent", () => {
    const pending: ConsentRecord = { ...grantedRecord, status: "PENDING" };
    const r = checkConsent([pending], "user1", "behavioral_monitoring");
    expect(r.allowed).toBe(false);
  });

  it("returns denied for different userId", () => {
    const r = checkConsent([grantedRecord], "user2", "behavioral_monitoring");
    expect(r.allowed).toBe(false);
  });

  describe("applyRevocation", () => {
    it("produces REVOKED record with timestamp", () => {
      const r = applyRevocation(grantedRecord, 5000);
      expect(r.status).toBe("REVOKED");
      expect(r.revokedAtMs).toBe(5000);
    });

    it("does not mutate original record", () => {
      applyRevocation(grantedRecord, 5000);
      expect(grantedRecord.status).toBe("GRANTED");
    });
  });
});
