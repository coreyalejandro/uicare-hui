# UICare HUI - Tier-1 Product Integration Plan

**Goal:** Consolidate all UICare projects into a unified, production-ready behavioral safety system with vision capabilities.

---

## Integration Architecture

```
uicare-hui/ (MAIN REPO - Tier-1 Product)
├── packages/
│   ├── safety-core/              [EXISTING] Pure TS behavioral safety
│   └── vision-processor/         [NEW] Vision-Agents integration for webcam
├── apps/
│   ├── pwa/                      [EXISTING] Next.js PWA
│   │   ├── src/components/       [MERGE] + uicare-components React components
│   │   ├── src/agents/           [NEW] MonitorAgent + RescueAgent from uicare-system
│   │   └── src/vision/           [NEW] Vision integration layer
│   └── experimental-tools/       [EXISTING] Research tools (isolated)
├── docs/                         [CONSOLIDATE] All documentation
├── PRODUCT_DEMAND_ANALYSIS.md    [MOVED] ✅
└── README.md                     [UPDATE] Unified product description
```

---

## Phase 1: Vision Integration (Critical for "Reading the Room")

### Why Vision-Agents?
The core UICare HUI innovation is detecting **what users STOP doing** (absence detection). This requires:
- Webcam monitoring of physical space
- Detection of avoidance behaviors (spots they avoid with body but watch with eyes)
- Micro-movement pattern analysis
- Object interaction tracking

### Integration Steps:

1. **Create vision-processor package**
   ```
   uicare-hui/packages/vision-processor/
   ├── src/
   │   ├── ports/
   │   │   └── VisionCollector.ts      # Port interface for vision signals
   │   ├── adapters/
   │   │   └── VisionAgentsAdapter.py  # Python bridge to Vision-Agents
   │   └── processors/
   │       ├── AbsenceDetector.ts      # Detects what user is NOT doing
   │       ├── GazeTracker.ts          # Eye tracking for avoidance patterns
   │       └── MovementAnalyzer.ts     # Micro-movement pattern detection
   ```

2. **Add Vision-Agents as Python dependency**
   - Use Vision-Agents' Ultralytics YOLO for pose detection
   - Use Moondream for visual understanding
   - Use Gemini/OpenAI Realtime for real-time video analysis

3. **Create TypeScript ↔ Python bridge**
   - WebSocket or IPC for real-time communication
   - Vision signals feed into existing risk-scorer.ts

---

## Phase 2: React Components Integration

### From portfolio-uicare/uicare-components → uicare-hui/apps/pwa

**Components to integrate:**
- `RealityFilter.tsx` - Visual mode switching
- `NinjaPresence.tsx` - Subtle visual feedback
- `SettingsPanel.tsx` - User customization
- `RealityProvider.tsx` - Context provider
- `SettingsContext.tsx` - Settings management
- `UIcareToolbar.tsx` - Main toolbar

**Integration approach:**
```bash
# Copy components to PWA
cp -r portfolio-uicare/uicare-components/src/app/components/* \
      uicare-hui/apps/pwa/src/components/uicare/

# Merge styles
cat portfolio-uicare/uicare-components/src/app/globals.css >> \
    uicare-hui/apps/pwa/src/app/globals.css
```

**Update imports in PWA:**
- Add to existing BehavioralGate.tsx
- Integrate with InterventionBanner.tsx
- Enhance useBehavioralSafety.ts hook

---

## Phase 3: Agent Integration

### From uicare-system → uicare-hui/apps/pwa/src/agents

**Agents to integrate:**
- `MonitorAgent` - Continuous behavioral analysis
- `RescueAgent` - Targeted intervention

**Integration approach:**

1. **Create agents directory:**
   ```
   uicare-hui/apps/pwa/src/agents/
   ├── MonitorAgent.ts
   ├── RescueAgent.ts
   ├── AgentOrchestrator.ts
   └── types.ts
   ```

2. **Port from uicare-system/aiService.js:**
   - Convert to TypeScript
   - Integrate with safety-core ports
   - Connect to Azure OpenAI (already configured in HUI)

3. **Wire into behavioral flow:**
   ```typescript
   // In useBehavioralSafety.ts
   import { MonitorAgent } from '@/agents/MonitorAgent';
   import { RescueAgent } from '@/agents/RescueAgent';
   
   // MonitorAgent feeds signals to risk-scorer
   // RescueAgent provides intervention content
   ```

---

## Phase 4: Documentation Consolidation

### Merge all docs into uicare-hui/docs/

**From uicare-system/docs/:**
- design-system.md
- mania-monitoring.md
- key-management.md
- performance.md
- UICare_Implementation_Plan.md

**From portfolio-uicare/uicare-components/:**
- Component usage examples
- Accessibility guidelines

**Create new docs:**
- `VISION_INTEGRATION.md` - How vision capabilities work
- `AGENT_ARCHITECTURE.md` - MonitorAgent + RescueAgent design
- `DEPLOYMENT.md` - Production deployment guide
- `USER_GUIDE.md` - End-user documentation

---

## Phase 5: Cleanup & Optimization

### Files to REMOVE (duplicates/unnecessary):

**From root UICare directory:**
- `portfolio-uicare/` - Components integrated, can archive
- `uicare-system/` - Agents integrated, can archive
- `Vision-Agents/` - Keep as git submodule or Python dependency
- `uicare-plans/` - Move to uicare-hui/docs/archive/

**Keep minimal structure:**
```
UICare/
└── uicare-hui/  (THE PRODUCT)
    ├── packages/
    ├── apps/
    ├── docs/
    ├── tests/
    └── README.md
```

---

## Phase 6: Build Configuration

### Update uicare-hui/apps/pwa/package.json:

```json
{
  "name": "@uicare-hui/pwa",
  "version": "1.0.0",
  "description": "UICare HUI - Behavioral Safety System with Vision Capabilities",
  "dependencies": {
    "@uicare-hui/safety-core": "*",
    "@uicare-hui/vision-processor": "*",
    "clsx": "^2.1.0",
    "framer-motion": "^12.9.2",
    "next": "^16.2.6",
    "next-pwa": "^2.0.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwind-merge": "^2.2.0",
    "openai": "^4.0.0",
    "ws": "^8.0.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint && eslint src --config ../../.eslintrc.boundaries.js",
    "test": "vitest run",
    "test:integration": "vitest run tests/integration",
    "typecheck": "tsc --noEmit",
    "vision:start": "python ../vision-processor/server.py"
  }
}
```

### Add Python requirements.txt:

```
uicare-hui/packages/vision-processor/requirements.txt:
vision-agents>=0.4.0
ultralytics>=8.0.0
opencv-python>=4.8.0
websockets>=12.0
```

---

## Phase 7: Testing Strategy

### Integration Tests:

1. **Vision → Risk Scoring:**
   - Test webcam input → absence detection → risk score increase
   - Verify gaze tracking feeds into behavioral state

2. **Agents → Intervention:**
   - Test MonitorAgent detects loops
   - Test RescueAgent provides appropriate intervention

3. **Components → Safety Core:**
   - Test RealityFilter works with BehavioralGate
   - Test SettingsPanel persists consent preferences

4. **End-to-End:**
   - User grants consent
   - Webcam monitors behavior
   - System detects absence pattern
   - Gate fires with intervention
   - User can override (except CRISIS_ADJACENT)

---

## Phase 8: Deployment

### Production Checklist:

- [ ] All tests passing (72 existing + new integration tests)
- [ ] Vision-Agents Python service containerized
- [ ] PWA builds successfully
- [ ] Service worker configured for offline
- [ ] Webcam permissions handled gracefully
- [ ] Privacy policy updated for vision monitoring
- [ ] Documentation complete
- [ ] GitHub repo cleaned and organized
- [ ] CI/CD pipeline configured
- [ ] Monitoring/logging in place

### Deployment targets:
1. **PWA:** Vercel/Netlify for web app
2. **Vision Service:** Docker container on cloud (AWS/GCP)
3. **Mobile:** PWA installable on iOS/Android

---

## Success Metrics

**Technical:**
- Build time < 2 minutes
- Test coverage > 80%
- Vision latency < 100ms
- Gate decision time < 50ms

**User:**
- Consent flow completion rate
- Intervention effectiveness (user feedback)
- False positive rate < 5%
- User retention after 30 days

---

## Timeline Estimate

- **Phase 1 (Vision):** 3-5 days
- **Phase 2 (Components):** 1-2 days
- **Phase 3 (Agents):** 2-3 days
- **Phase 4 (Docs):** 1 day
- **Phase 5 (Cleanup):** 1 day
- **Phase 6 (Build):** 1 day
- **Phase 7 (Testing):** 2-3 days
- **Phase 8 (Deploy):** 1-2 days

**Total:** 12-18 days for complete integration

---

## Next Immediate Steps

1. Create `packages/vision-processor/` directory structure
2. Copy Vision-Agents examples for pose detection
3. Build TypeScript ↔ Python bridge
4. Test webcam → risk score pipeline
5. Integrate one component (RealityFilter) as proof of concept

---

**Status:** Planning complete, ready to begin Phase 1