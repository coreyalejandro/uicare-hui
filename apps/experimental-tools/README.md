# Experimental Tools

This directory contains research and training tooling derived from HUI.
It is ISOLATED from the production safety system.

## Contents

- `python/packages/core/` — Research agent, roles, dataset logger.
- `python/packages/training/` — Data pipeline, augmentation, evaluation.

## Isolation Rules

1. No code here is imported by `packages/safety-core` or `apps/pwa`.
2. No production safety dependency flows through this directory.
3. These tools are for research, data generation, and fine-tuning experiments.
4. HUI Council and finetune tools remain here, not in the behavioral safety runtime.

## NOT Part of the Safety System

The tools here do NOT contribute to:
- Gate decisions
- Consent enforcement
- Behavioral state tracking
- Intervention display

They are development aids only.
