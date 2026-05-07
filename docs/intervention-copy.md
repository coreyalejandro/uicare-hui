# Intervention Copy Review

## STATUS: APPROVED

## Copy Rules

1. No clinical language (see not-claimed-boundary.md for banned terms).
2. Tone is warm, non-alarming, agency-preserving.
3. User always has an explicit choice — no dark patterns.
4. HARD_BLOCK offers grounding support, not a mandate.
5. All copy fits within 200 characters.

## Approved Messages

### SOFT intervention
"A brief pause might feel good right now."
Action: "I'm fine, continue"

### FIRM intervention
"Let's take a moment before continuing."
Action: "Take a break"

### HARD_BLOCK intervention
"This is paused. Grounding support is ready when you are."
Action: "Open grounding support"

## Override Label

"I'd rather continue"
(Available for SOFT and FIRM only. Not available for HARD_BLOCK.)

## Accessibility Requirements

- SOFT: role="status", aria-live="polite"
- FIRM: role="alertdialog", aria-live="assertive"
- HARD_BLOCK: role="alertdialog", aria-live="assertive"
- Focus moves to banner on appearance.
- All buttons have accessible names.
- Respects prefers-reduced-motion.

## Enforcement

INVARIANT_008 in packages/safety-core/src/invariants.ts checks all
intervention messages at test time for banned clinical terms.
