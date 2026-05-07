# AGENTS.md — uicare-hui

## Repo Role in the Constitutional Ecosystem

This repository is a **Satellite project** of The Living Constitution Commonwealth.
Constitutional authority: coreyalejandro/the-living-constitution (supreme)
Executed contract: projects/c-rsp/instances/CRSP-UICARE-HUI-001.md
This repo: implementation of a Behavioral Safety System for high-risk
neurodivergent users — hexagonal architecture, local-first, offline-capable.

---

## The Six Invariants (I1–I6)

All agents operating in this codebase are bound by these invariants.
They are not preferences. They are runtime constraints.

**I1 — Evidence-First Outputs**
Every claim must be tagged with its evidence basis.
VERIFIED (confirmed against source) | CONSTRUCTED (reasoned, no empirical data) |
PENDING (awaiting confirmation).
Do not omit the tag. Do not default to implicit confidence.

**I2 — No Phantom Work**
Do not claim completion without showing the work.
Do not add percentages or comparative claims without a named methodology,
baseline, and dataset. If data does not exist: "PENDING empirical confirmation."

**I3 — Confidence Requires Verification**
Hedged language is not a substitute for verification.
"Likely," "probably," "appears to" do not satisfy I1.
If you cannot verify, flag explicitly: UNVERIFIED.

**I4 — Traceability Is Mandatory**
All code changes, document edits, and architectural decisions must be
traceable to a stated reason. Commit messages must name the invariant
category or governance step being addressed. No silent refactors.

**I5 — Safety Over Fluency**
When a correct response and a fluent response conflict, correct wins.
This applies to code, documentation, and governance claims.
Fluent wrong answers are the primary failure mode this framework detects.

**I6 — Fail Closed**
When in doubt about whether an action violates an invariant, do not proceed.
Flag the uncertainty. Ask for clarification.
The system can tolerate a pause. It cannot tolerate a phantom claim
embedded in a safety-critical codebase.

---

## The Contract Window Protocol

Before beginning any significant task in this repo, establish the Contract Window:

```
TASK STATE:      [What are we doing and why]
INVARIANT STATUS: [Which I1-I6 constraints are active for this task]
REPAIR OBLIGATIONS: [What has broken or is at risk of breaking]
TRUTH STATUS:    [VERIFIED / CONSTRUCTED / PENDING / UNVERIFIED per item]
```

For tasks that touch packages/safety-core — the architectural boundary is
constitutional. Any change to port interfaces must name which downstream
adapter is affected and confirm the adapter will be updated in the same PR.

---

## Bicameral Review

Before committing any output (code, documentation, governance change), pass
both channels:

**Safety Channel:** Does this output violate I1–I6? Does it introduce a
phantom claim, silent assumption, or mutation to a constitutional surface
without review? Does it add a runtime dependency to packages/safety-core?
Does it add clinical language to user-facing copy?

**Relational Channel:** Does this output preserve the integrity of the
hexagonal boundary? Does it advance the safety mission without degrading
the enforceability of INVARIANT_001 through INVARIANT_011?

Both channels must clear. If either raises a flag, do not proceed.

---

## V&T Statement Requirement

Every substantive output must end with a V&T statement:

```
V&T: [ITEM] — EXISTS (verified present) → VERIFIED AGAINST [source/method]
     → NOT CLAIMED [explicit exclusions] → FUNCTIONAL STATUS [current state]
```

Applies to: code commits, documentation additions, governance claims,
status updates, and any output surfaced to the human operator.

---

## Architectural Invariants for This Repo

**INVARIANT_011 (structural):**
packages/safety-core has zero runtime dependencies. It must not import
from apps/*, from React, from Node.js APIs, or from browser APIs.
Enforced by CI ESLint boundary lint. Violations halt the build.
No override exists.

**INVARIANT_001 (runtime):**
Behavioral monitoring must not activate without ConsentRecord.status === GRANTED.
Enforced in packages/safety-core/src/consent/consent-enforcer.ts.

**INVARIANT_003 (runtime):**
HARD_BLOCK state has no override path. No adapter, no UI, no user action
can create an override at gate level 3. Enforced in override-policy.ts.

**INVARIANT_008 (content):**
Zero clinical language in any user-facing copy.
Enforced in intervention copy docs and tested in governance test suite.

**INVARIANT_009 (runtime):**
AI unavailability (null AIAdvisor) must not disable local safety gates.
Gates fall through to local-only assessment when AI returns null.

---

## BREAK_GLASS Protocol

If you encounter a situation where following these invariants would cause
the task to fail, or two invariants appear to conflict:

1. Stop the current action
2. Document the conflict at: docs/break-glass/BREAK_GLASS_[DATE]_[DESC].md
   (create docs/break-glass/ if it does not exist)
3. State which invariants are in tension and why
4. Do not resolve silently — surface to the human operator

---

## Safety-Critical Constraints

This codebase gates real user actions during unsafe behavioral states.
The following are hard stops — no agent may bypass them:

- Do not add clinical language to any user-facing string
- Do not add a runtime dependency to packages/safety-core
- Do not add an override path for HARD_BLOCK
- Do not remove consent enforcement from the signal collection path
- Do not move safety logic out of packages/safety-core into adapters

---

## Repo Owner

Corey Alejandro — github.com/coreyalejandro
Constitutional authority escalates to repo owner.
This AGENTS.md governs agents. The repo owner governs the constitution.

---

V&T: AGENTS.md — EXISTS (written 2026-05-07) → VERIFIED AGAINST TLC root
AGENTS.md (I1-I6 structure), SentinelOS CLAUDE.md (architectural rules),
CRSP-UICARE-HUI-001.md (invariants list) → NOT CLAIMED: automated I1-I6
enforcement beyond ESLint boundary lint (INVARIANT_011); no claim that all
invariants have runtime assertion coverage in current adapter layer →
FUNCTIONAL STATUS: active governance document; binds all agents working
in this repo from this commit forward
