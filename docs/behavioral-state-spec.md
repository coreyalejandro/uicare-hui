# Behavioral State Machine Specification

## STATUS: APPROVED

## States

| State | Description | Gate Level |
|---|---|---|
| BASELINE | Within normal parameters | ALLOW |
| ELEVATED | Mild deviation (score >= 0.25) | SOFT_GATE |
| HEIGHTENED | Significant deviation (score >= 0.50) | FIRM_GATE |
| ACUTE | High deviation (score >= 0.70) | FIRM_GATE |
| CRISIS_ADJACENT | Maximum local detection (score >= 0.85) | HARD_BLOCK |

## Transition Rules

1. Upward transitions use score thresholds directly.
2. Downward transitions apply 0.08 hysteresis to prevent state flapping.
3. Downward transitions step one level at a time (gradual de-escalation).
4. Cold start observation window: 5 minutes from first signal.
5. During cold start, state is BASELINE and all gates are suppressed.

## Risk Score Computation

Inputs: heartRateDelta, sleepDeficitDelta, activityDelta, textVolumeRecent.
Weights: heart 0.33, sleep 0.34, activity 0.33, text overlay max 0.10.
Range: [0.0, 1.0].
Cold start: returns 0 if sampleCount < 3.

## Baseline Algorithm

Welford online moving average over all signal samples.
Immutable update pattern — no module-level mutable state.
Baseline is persisted to IndexedDB by adapter after each ingestion.

## Invariants

INVARIANT_004: Only states in defined set are valid.
INVARIANT_005: Risk score must be in [0,1].
INVARIANT_009: Gates suppressed during cold start.
