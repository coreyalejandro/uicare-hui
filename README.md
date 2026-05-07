# UICare HUI — Behavioral Safety System

A fail-safe Progressive Web App for high-risk neurodivergent users.

Detects manic, compulsive, or destabilizing activity patterns before they escalate
into high-stakes actions. Slows or blocks risky user actions during elevated-risk
periods using restrictive action gates, local-first safety logic, and consent-aware
monitoring flows.

This is a behavioral safety aid. It is not a medical device, does not provide
clinical diagnosis, and does not replace emergency services.

---

## What it does

**Behavioral-state tracking**
The system continuously scores incoming behavioral signals against a personal
baseline. A five-level state machine (BASELINE → ELEVATED → MONITORED →
RESTRICTED → HARD_BLOCK) advances or retreats based on signal risk, not on
arbitrary timers. Cold-start policy holds the system in observation mode for the
first hour after first signal, preventing premature escalation on insufficient data.

**Restrictive action gates**
Before any protected action executes, `evaluateGate()` in `packages/safety-core`
checks the current behavioral state, the consent snapshot, and whether the action
is flagged as high-risk. Gate decisions are:

  ALLOW            — proceed normally
  SOFT_WARN        — surface a friction message, user may continue
  CONFIRM_REQUIRED — explicit re-confirmation required before proceeding
  HARD_BLOCK       — action is blocked; no override path exists

HARD_BLOCK is a terminal gate. There is no bypass.

**Local-first safety logic**
All gate decisions, state transitions, consent enforcement, and invariant checks
run entirely in `packages/safety-core` — pure TypeScript, zero runtime
dependencies, no browser or Node.js APIs. The system is fully functional offline.
Azure OpenAI is an optional adapter; if the network is down or the API fails, the
null AI adapter kicks in and local gates remain fully operational.

**High-reliability state management**
State is immutable at the core level. Every transition is deterministic: given the
same behavioral state, signal history, and consent record, the state machine
produces the same output every time. No global mutable state. No side effects
inside the core.

**Consent-aware monitoring flows**
Behavioral monitoring cannot activate unless `ConsentRecord.status === 'GRANTED'`.
This is INVARIANT_001 — enforced as a runtime assertion that will throw, not silently
degrade. Consent revocation immediately halts all monitoring. The consent flow is
defined via the `ConsentStore` port; the PWA implements it with IndexedDB.

**Observable behavioral signals**
The `SignalCollector` port defines a typed interface for any signal source —
wearable sensor, UI event, session activity — without coupling the core to any
specific hardware or browser event. The risk scorer weights signal classes
(velocity, repetition, escalation, override attempts) and produces a numeric score
the state machine consumes.

**User-facing intervention states**
`InterventionBanner` and `BehavioralGate` are PWA-layer React adapters that
implement the `InterventionDisplay` port. Copy is non-clinical, agency-preserving,
and WCAG 2.1 AA compliant. The system does not tell users they are sick; it tells
them it noticed a pattern and asks them to pause.

---

## Architecture

Hexagonal (ports & adapters). The innermost hexagon is `packages/safety-core`.
It exports port interfaces and pure domain logic. The PWA and any future tooling
are outer adapters.

```
packages/safety-core/          Pure TypeScript. Zero runtime deps.
  src/ports/                   SignalCollector, ConsentStore, InterventionDisplay,
                               AuditLogger, DataLifecycle, Clock, AIAdvisor
  src/behavioral/              state-machine, risk-scorer, cold-start-policy,
                               feedback-classifier, baseline-manager
  src/safety/                  action-gate, override-policy, intervention,
                               agency-preservation, crisis-detector
  src/consent/                 consent-enforcer, consent-validator
  src/invariants.ts            11 typed assertion functions
  src/index.ts                 public API

apps/pwa/                      Next.js 14 PWA. Outer adapter layer.
  src/adapters/consent/        IndexedDBConsentStore  (implements ConsentStore port)
  src/adapters/storage/        baselineStorage        (AES-256-GCM encrypted)
  src/adapters/ai/             AzureOpenAIAdvisor     (implements AIAdvisor port)
  src/components/gates/        BehavioralGate         (React gate UI)
  src/components/interventions/ InterventionBanner    (WCAG 2.1 AA)
  src/lib/                     useBehavioralSafety, encryption

apps/experimental-tools/       Isolated Python tooling (HUI Council, dataset logger).
                               No production safety dependency.
```

Dependency direction is inward only. `safety-core` never imports from `apps/*`
or any package that brings in React or browser APIs. This is enforced by ESLint
boundary rules in `.eslintrc.boundaries.js` (INVARIANT_011). The CI lint job
blocks merge on any violation.

---

## Invariants

The system is governed by 11 invariants. All are asserted at runtime in
`packages/safety-core/src/invariants.ts` and exercised in the test suite.

  I001  Monitoring requires GRANTED consent
  I002  Risk score is always in [0, 1]
  I003  HARD_BLOCK state has no override path
  I004  Gate decision is deterministic given same inputs
  I005  Cold-start policy blocks RESTRICTED/HARD_BLOCK during observation window
  I006  Consent revocation halts monitoring immediately
  I007  Audit log entry is immutable once written
  I008  No clinical language in any user-facing copy
  I009  AI failure does not disable local gates
  I010  Data lifecycle operations require explicit user authorization
  I011  safety-core has zero runtime dependencies (CI-enforced)

---

## Test coverage

57 unit tests passing in `packages/safety-core` (5 test files).
15 governance-invariant tests passing in `tests/governance/`.
All tests run in a plain TypeScript environment — no DOM, no browser stubs.

  packages/safety-core
    consent-enforcer.test.ts     7 tests
    risk-scorer.test.ts          7 tests
    action-gate.test.ts          9 tests
    state-machine.test.ts       10 tests
    invariants.test.ts          24 tests

  tests/governance
    invariants.test.ts          15 tests

---

## Getting started

```
git clone https://github.com/coreyalejandro/uicare-hui
cd uicare-hui
npm install
```

Run core unit tests:

```
cd packages/safety-core
npx vitest run
```

Run lint + boundary check (INVARIANT_011):

```
npm run lint:boundaries
```

Build the PWA:

```
cd apps/pwa
npm run build
```

---

## Status

Build contract: CRSP-UICARE-HUI-001
Governance: The Living Constitution (Satellite topology)
Gate status: APPROVED
All specification documents approved as of 2026-05-07.
See STATUS.json and docs/governance-report.md.

Not deployed. No live demo URL. Per governance constraint (PUBLIC_POSITIONING.md):
no public URL until observable behavior matches stated claims.

---

## Not-claimed boundary

This system does not:
- Diagnose any condition
- Qualify as a medical device
- Replace emergency services or clinical support
- Guarantee prevention of any specific harm

It is a local-first behavioral safety aid that the user controls, consents to, and
can disable at any time.
