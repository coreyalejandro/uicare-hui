# CLAUDE.md — uicare-hui

## Constitutional Governance

This repository operates under The Living Constitution (TLC).
Governing repo: https://github.com/coreyalejandro/the-living-constitution
TLC overlay: projects/uicare-hui/
Executed C-RSP instance: projects/c-rsp/instances/CRSP-UICARE-HUI-001.md

All agents (human or AI) working in this codebase are bound by
TLC Articles I–V and the six invariants declared in AGENTS.md.

## What This Repo Is

uicare-hui is a Hexagonal Architecture monorepo implementing a
Behavioral Safety System for High-Risk Neurodivergent Users.

It is a local-first, offline-capable PWA safety aid. It is NOT
a medical device, clinical diagnostic tool, or emergency-response
system.

## Repo Structure

packages/
  safety-core/          Pure TypeScript. Zero runtime deps.
                        Ports + domain logic only.
                        Source of truth for ALL safety decisions.
apps/
  pwa/                  Next.js 14 PWA. Implements core ports
                        via concrete adapters (IndexedDB, React,
                        service worker, optional AI wrapper).
  experimental-tools/   HUI Python research. Isolated.
                        No production safety dependency.
tests/
  fixtures/             Behavioral trace fixtures
  governance/           End-to-end invariant tests
docs/                   Governance spec documents
.github/workflows/      CI: boundary-check, spec-gate,
                        core-tests, pwa-typecheck, governance

## Architectural Law (INVARIANT_011)

packages/safety-core MUST have zero runtime dependencies.
It MUST NOT import from apps/*, from any UI library, or
from any Node.js/browser-specific module.

This is enforced by CI ESLint boundary lint on every PR.
A violation halts the build. There is no override.

## Safety Invariants

INVARIANT_001 — Monitoring requires ConsentRecord.status === GRANTED
INVARIANT_003 — HARD_BLOCK state has no override path
INVARIANT_008 — Zero clinical language in user-facing copy
INVARIANT_009 — AI unavailability must not disable local gates
INVARIANT_011 — packages/safety-core has zero runtime deps

All 11 invariants implemented in packages/safety-core/src/invariants.ts

## Domain Authority

packages/safety-core/src/ is the single source of truth for all
safety logic. Adapters in apps/pwa/src/adapters/ implement ports.
Never bypass the port interface. Never add safety logic to adapters.

## Not Claimed

- Not a medical device
- Not an emergency-response system
- Not a clinical diagnostic tool
- Does not replace professional mental-health care
- AuditLogger IndexedDB adapter not yet written
- DataLifecycle adapter not yet written
- Real SignalCollector wearable adapter not yet written
- apps/pwa next build not CI-verified

## Commands

npm run build          # builds packages/safety-core
npm run test           # 72 tests (unit + governance)
npm run test:core      # 57 unit tests only
npm run lint:boundaries  # INVARIANT_011 ESLint boundary check

## TLC Articles (governing this repo)

Article I   — SentinelOS Bill of Rights (safety, accessibility,
              dignity, clarity for every user/agent interaction)
Article II  — Execution Law (immutability, test coverage,
              modularity, security, context management)
Article III — Purpose Law (every action maps to intended change
              and measurable outcome)
Article IV  — Agent Powers and Limitations (what agents CAN and
              CANNOT do without human review)
Article V   — Amendment Process (how rules change through
              lessons -> proposal -> eval -> ratification)
