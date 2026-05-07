# Hexagonal Boundaries — Port and Adapter Map

## STATUS: APPROVED

## Architecture Diagram

```
+---------------------------------------------------------------+
|                    OUTER LAYER (Infrastructure)               |
|                                                               |
|  [IndexedDBConsentStore]   [AzureOpenAIAdvisor]               |
|  [baselineStorage]         [BehavioralGate]                   |
|  [encryption.ts]           [InterventionBanner]               |
|  [useBehavioralSafety]     [service worker]                   |
|                                                               |
|   +---------------------------------------------------------+ |
|   |              PWA ADAPTER LAYER (apps/pwa)               | |
|   |                                                         | |
|   |   implements ports:                                     | |
|   |   ConsentStore  AuditLogger  InterventionDisplay        | |
|   |   AIAdvisor     DataLifecycle  SignalCollector           | |
|   |                                                         | |
|   |   +-------------------------------------------+        | |
|   |   |         SAFETY-CORE (packages/safety-core) |        | |
|   |   |                                           |        | |
|   |   |   PORTS (interfaces only):                |        | |
|   |   |   Clock  SignalCollector  ConsentStore     |        | |
|   |   |   InterventionDisplay  AuditLogger         |        | |
|   |   |   DataLifecycle  AIAdvisor                 |        | |
|   |   |                                           |        | |
|   |   |   DOMAIN LOGIC (pure functions):          |        | |
|   |   |   state-machine  risk-scorer              |        | |
|   |   |   cold-start-policy  feedback-classifier  |        | |
|   |   |   baseline-manager  action-gate           |        | |
|   |   |   override-policy  intervention           |        | |
|   |   |   agency-preservation  crisis-detector    |        | |
|   |   |   consent-enforcer  consent-validator     |        | |
|   |   |   invariants                              |        | |
|   |   +-------------------------------------------+        | |
|   +---------------------------------------------------------+ |
+---------------------------------------------------------------+
```

## Dependency Rule

Arrows point INWARD ONLY.

- safety-core has ZERO dependencies on any outer layer.
- apps/pwa imports from safety-core (ports + pure functions) only.
- Infrastructure (IndexedDB, fetch, crypto) exists ONLY in outer layers.
- No React, no DOM, no Node.js in safety-core.

## Port-to-Adapter Mapping

| Port (safety-core) | Adapter (apps/pwa) |
|---|---|
| ConsentStore | IndexedDBConsentStore |
| AIAdvisor | AzureOpenAIAdvisor (+ NULL_AI_ADVISOR fallback) |
| InterventionDisplay | BehavioralGate + InterventionBanner |
| Clock | Injected as `() => Date.now()` by useBehavioralSafety |
| SignalCollector | Synthetic in useBehavioralSafety (real wearable TBD) |
| AuditLogger | TBD — IndexedDB implementation pending Phase 6 |
| DataLifecycle | TBD — pending consent revocation flow Phase 6 |

## CI Enforcement

File: .eslintrc.boundaries.js
Runs on: packages/safety-core/src/**/*.ts
Blocks: imports from react, next, fs, crypto, idb, apps/*, packages/* (other)
CI step: npm run lint:boundaries
Gate: blocks merge on violation (INVARIANT_011)
