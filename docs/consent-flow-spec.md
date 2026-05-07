# Consent Flow Specification

## STATUS: APPROVED

## Principles

1. Consent is required before behavioral monitoring activates (INVARIANT_001).
2. Consent can be revoked at any time via a protected action (never gated).
3. Revocation takes effect immediately — no batch processing.
4. On revocation, all monitoring ceases and user may request data erasure.
5. Default state is PENDING — no consent assumed.

## Features Requiring Consent

| Feature ID | Description | Required for Gates |
|---|---|---|
| behavioral_monitoring | Signal collection + risk scoring + gates | Yes |
| audit_logging | Local audit event storage | No (recommended) |
| data_export | User data portability | No |

## Consent Record Schema

Defined in packages/safety-core/src/ports/ConsentStore.ts:
- userId: string
- feature: string
- status: GRANTED | DENIED | PENDING | REVOKED
- grantedAtMs: number | null
- revokedAtMs: number | null
- version: number (increments on each change)

## Revocation Flow

1. User taps "Stop monitoring" (protected action — never gated).
2. useBehavioralSafety.revokeConsent(feature) is called.
3. IndexedDBConsentStore.revoke() writes REVOKED record to IndexedDB.
4. consentRecords state is refreshed.
5. Next signal ingestion tick finds no GRANTED consent and skips.
6. Gate evaluations for behavioral_monitoring return ALLOW (no consent = no gate).

## Invariants

INVARIANT_001: Monitoring must not activate without GRANTED consent.
INVARIANT_007: Revocation must be reflected immediately in loaded records.
