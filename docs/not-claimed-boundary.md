# Not-Claimed Boundary Statement

## STATUS: APPROVED

This document defines what the UICare behavioral safety system DOES NOT claim.

## Hard Boundaries

1. This system is NOT a medical device.
2. This system does NOT diagnose any condition.
3. This system does NOT provide emergency response services.
4. This system does NOT replace clinical care, therapy, or professional support.
5. This system does NOT detect mania, psychosis, or any named psychiatric condition.
6. This system does NOT contact external emergency services.
7. This system does NOT provide clinical advice or recommendations.
8. This system does NOT guarantee detection of any behavioral pattern.

## What the System Does

- Tracks anonymized behavioral signal trends for a user who has explicitly consented.
- Applies locally-computed risk scores to surface optional pauses and grounding support.
- Presents non-clinical, non-alarming UI to support user agency.
- Operates fully offline for all safety-critical logic.
- Allows the user to override or disable all monitoring at any time.

## User Copy Rule

No user-facing string may contain the terms:
diagnosis, disorder, bipolar, mania, psychosis, emergency, suicide, self-harm,
hospitalize, medication, prescription, or medical.

This is enforced by INVARIANT_008 in packages/safety-core/src/invariants.ts.
