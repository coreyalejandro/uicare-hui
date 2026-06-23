# UICare HUI — Behavioral Safety System

**A fail-safe Progressive Web App for high-risk neurodivergent users with vision-based "reading the room" capabilities.**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![Tests](https://img.shields.io/badge/tests-72%20passing-success)]()

---

## 🎯 What It Does

UICare HUI prevents catastrophic decisions during behavioral crises by detecting **what you're NOT doing** — the most reliable predictor of mood state and impaired judgment.

### Real User Scenarios

**User A — Bipolar, Hypomanic Episodes**

> Tuesday, 2am. Heart rate elevated. 4,000 words typed in the last hour. Three hours of sleep. You open your banking app to move money. Before the transfer completes, the system stops you — not with a diagnosis, not with an alarm — with a single screen: "We noticed a pattern. Take a breath. You can still do this, but not right now."

At CRISIS_ADJACENT, there is no override. The button does not exist. That is the point.

**User B — ADHD, Compulsive Spending**

> Same system, same consent flow. The friction is proportional to your signals. At ELEVATED you get a soft message. At HEIGHTENED you confirm. At ACUTE you confirm again. You still have agency at every level except the top.

You can revoke consent at any time. One tap. Monitoring stops immediately.

---

## 🚀 Key Features

### 1. **Vision-Based Absence Detection** 🎥
- **Webcam monitoring** detects what you're NOT doing
- **Gaze tracking** identifies avoidance patterns (looking but body turned away)
- **Movement analysis** catches micro-behavior changes
- **Object interaction** tracking notices when you stop using typical items
- **Spatial behavior** understanding (the spot you avoid with your body but watch with your eyes)

### 2. **Behavioral Safety Core** 🛡️
- **Risk scoring** based on your personal baseline (not population norms)
- **State machine** with 5 levels: BASELINE → ELEVATED → HEIGHTENED → ACUTE → CRISIS_ADJACENT
- **Proportional friction** at decision points
- **Hard block** at crisis level (no override available)
- **Offline-first** — works without network

### 3. **AI Agents** 🤖
- **MonitorAgent** — Continuous behavioral loop detection
- **RescueAgent** — Targeted, neurodivergent-friendly interventions
- **Never punitive, always precise**

### 4. **Neurodivergent-Friendly UI** ♿
- **Reality Filters** — Visual modes (Standard, Ninja Vision, Protocol)
- **Trauma-informed** interactions
- **WCAG 2.1 AA** accessibility
- **Reduced motion** support
- **Customizable** settings panel

### 5. **Privacy & Consent First** 🔒
- **Explicit consent** required before monitoring
- **One-tap revocation** with immediate effect
- **AES-256-GCM** encryption for all data
- **Device-only storage** — never transmitted
- **No grace period** on revocation

---

## 📊 Why This Matters

### The Problem
Current behavior-monitoring systems capture what users **DO**. They miss what matters most: what users **STOP** doing.

- The file they haven't touched in three days when they normally open it first
- The commit pattern that went from structured to chaotic overnight
- The spot in the room they're avoiding with their body but can't keep their eyes off

### The Solution
UICare HUI is the first system that **reads the room** for the right signs.

### Market Size
- **15-20% of population is neurodivergent**
- Bipolar disorder: ~2.8% of US adults (7+ million)
- ADHD: ~4.4% of US adults (10+ million)
- Autism: ~2.2% of US adults (5+ million)
- **Combined: 20+ million US adults**

### Competitive Gap
**NO existing system monitors behavioral absence.** Existing tools: productivity trackers, mood journals, medication reminders. None prevent catastrophic actions at the decision point.

---

## 🏗️ Architecture

### Hexagonal (Ports & Adapters)

```
┌─────────────────────────────────────────────────────────────┐
│                    packages/safety-core                     │
│              Pure TypeScript, Zero Runtime Deps             │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │Behavioral│  │  Safety  │  │ Consent  │  │  Ports   │     │
│  │  Domain  │  │  Domain  │  │  Domain  │  │Interface │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                                                             │
│  • state-machine    • action-gate     • consent-enforcer    │
│  • risk-scorer      • intervention    • consent-validator   │
│  • baseline-manager • crisis-detector                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 packages/vision-processor                   │
│              Vision-Based Absence Detection                 │
│                                                             │
│  • VisionCollector port    • AbsenceDetector                │
│  • GazeTracker             • MovementAnalyzer               │
│  • Vision-Agents bridge    • Object interaction tracking    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────┐
│                        apps/pwa                           │
│                   Next.js 14 PWA                          │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Components  │  │    Agents    │  │   Adapters   │     │
│  │              │  │              │  │              │     │
│  │ • Reality    │  │ • Monitor    │  │ • IndexedDB  │     │
│  │   Filter     │  │   Agent      │  │ • Azure AI   │     │
│  │ • Behavioral │  │ • Rescue     │  │ • Baseline   │     │
│  │   Gate       │  │   Agent      │  │   Storage    │     │
│  │ • Settings   │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└───────────────────────────────────────────────────────────┘
```

---

## 🚦 Behavioral States & Gates

| State | Risk Score | Gate Type | Override Available | Example |
|-------|-----------|-----------|-------------------|---------|
| **BASELINE** | < 0.25 | ALLOW | N/A | Normal activity |
| **ELEVATED** | ≥ 0.25 | SOFT_GATE | ✅ Yes | "Take a moment" |
| **HEIGHTENED** | ≥ 0.50 | FIRM_GATE | ✅ Yes | "Confirm this action" |
| **ACUTE** | ≥ 0.70 | FIRM_GATE | ✅ Yes | "Confirm again" |
| **CRISIS_ADJACENT** | ≥ 0.85 | HARD_BLOCK | ❌ **NO** | "Not right now" |

---

## 📦 Installation

### Prerequisites
- Node.js 18.0.0+
- Python 3.12+ (for vision processing)
- Webcam (for vision features)

### Quick Start

```bash
# Clone repository
git clone https://github.com/coreyalejandro/uicare-hui
cd uicare-hui

# Install dependencies
npm install

# Run tests
cd packages/safety-core && npx vitest run

# Start PWA development server
cd apps/pwa && npm run dev
```

Visit `http://localhost:3000`

---

## 🧪 Testing

```bash
# Safety core tests (72 passing)
cd packages/safety-core
npx vitest run

# Integration tests
cd tests/governance
npx vitest run

# Lint boundary rules
npm run lint:boundaries
```

**Coverage:** 80%+ branches, functions, lines

---

## 📚 Documentation

- [**Product Demand Analysis**](PRODUCT_DEMAND_ANALYSIS.md) — Why UICare HUI is the most in-demand product
- [**Integration Plan**](INTEGRATION_PLAN.md) — How all components fit together
- [**Behavioral State Spec**](docs/behavioral-state-spec.md) — State machine details
- [**Consent Flow Spec**](docs/consent-flow-spec.md) — Consent implementation
- [**Governance Report**](docs/governance-report.md) — Safety invariants
- [**Design System**](docs/design-system.md) — Neurodivergent-friendly design
- [**Mania Monitoring**](docs/mania-monitoring.md) — Wearable sensor integration

---

## 🔐 Privacy & Security

- **AES-256-GCM encryption** for all stored data
- **Device-only storage** — never transmitted to servers
- **Explicit consent** required before any monitoring
- **One-tap revocation** with immediate effect
- **No grace period** — monitoring stops instantly
- **Protected actions** always allowed (emergency, accessibility, consent)
- **Audit logging** for all gate decisions

---

## 🎨 Customization

### Reality Filters
- **Standard** — Default appearance
- **Ninja Vision** — High contrast, saturated
- **Protocol** — Sepia-toned, focused

### Settings Panel
- Consent management
- Visual preferences
- Baseline calibration
- Notification preferences

---

## 🤝 Contributing

Contributions welcome! This system is built from lived experience and benefits from diverse perspectives.

### Areas for Contribution
- Vision processing improvements
- Additional behavioral patterns
- Intervention copy refinement
- Accessibility enhancements
- Documentation

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 🙏 Acknowledgments

- Built from lived experience as an autistic, schizophrenic person with OCD, ADHD, and anxiety
- Inspired by Shakespeare's confidante — the character who sees the protagonist more clearly than they see themselves
- Special thanks to the neurodivergent community for insights and feedback
- Vision capabilities powered by [Vision-Agents](https://github.com/GetStream/Vision-Agents)

---

## ⚠️ Important Disclaimers

**This is a behavioral safety aid. It is NOT:**
- A medical device
- A diagnostic tool
- A replacement for emergency services
- A replacement for clinical support
- A guarantee of harm prevention

**The user:**
- Must provide explicit consent
- Can revoke consent at any time
- Retains agency at all levels except CRISIS_ADJACENT
- Is responsible for their own safety

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/coreyalejandro/uicare-hui/issues)
- **Discussions:** [GitHub Discussions](https://github.com/coreyalejandro/uicare-hui/discussions)
- **Email:** support@uicare.dev

---

## 🗺️ Roadmap

### ✅ Completed
- [x] Safety-core with 72 passing tests
- [x] Hexagonal architecture
- [x] Consent enforcement
- [x] Behavioral state machine
- [x] Risk scoring with baselines
- [x] Vision processor foundation
- [x] MonitorAgent & RescueAgent
- [x] React components integration
- [x] Documentation consolidation

### 🚧 In Progress
- [ ] Vision-Agents Python bridge
- [ ] Webcam integration
- [ ] Real-time absence detection
- [ ] Integration testing

### 📋 Planned
- [ ] Production deployment
- [ ] Mobile PWA optimization
- [ ] Wearable sensor integration
- [ ] Multi-language support
- [ ] Community feedback loop

---

**Status:** Build verified locally. Not yet deployed.  
**Version:** 0.1.0  
**Last Updated:** 2026-06-23

---

*"This is not theoretical. This is the system the designer needed and never had."*
