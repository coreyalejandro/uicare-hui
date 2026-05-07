"use client";
/**
 * useBehavioralSafety — Core orchestration hook
 * Wires all safety-core pure functions together with PWA adapters.
 *
 * This hook is the primary integration point between:
 * - packages/safety-core (pure logic)
 * - apps/pwa adapters (IndexedDB, AI, consent)
 *
 * Dependency direction: hook -> core ports/functions only.
 * Core never imports this hook.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  createEmptySnapshot,
  ingestSignal,
  computeRiskScore,
  transitionState,
  evaluateGate,
  evaluateColdStart,
  type BehavioralState,
  type BaselineSnapshot,
  type GateResult,
  type BehavioralSignal,
  type ConsentRecord,
  NULL_AI_ADVISOR,
  assertMonitoringRequiresConsent,
  assertRiskScoreRange,
  assertColdStartGatesSuppressed,
} from "@uicare-hui/safety-core";

import { loadBaselineSnapshot, saveBaselineSnapshot } from "../adapters/storage/baselineStorage.js";
import { IndexedDBConsentStore } from "../adapters/consent/IndexedDBConsentStore.js";

interface SafetyState {
  behavioralState: BehavioralState;
  riskScore: number;
  coldStartActive: boolean;
  consentRecords: ConsentRecord[];
  isReady: boolean;
}

interface SafetyActions {
  evaluateAction: (action: string, isProtected?: boolean) => GateResult;
  revokeConsent: (feature: string) => Promise<void>;
}

const consentStore = new IndexedDBConsentStore();

export function useBehavioralSafety(userId: string): SafetyState & SafetyActions {
  const [state, setState] = useState<SafetyState>({
    behavioralState: "BASELINE",
    riskScore: 0,
    coldStartActive: true,
    consentRecords: [],
    isReady: false,
  });

  const snapshotRef = useRef<BaselineSnapshot>(createEmptySnapshot());
  const stateRef = useRef<BehavioralState>("BASELINE");

  // Initialize: load consent + baseline from IndexedDB
  useEffect(() => {
    if (!userId) return;

    (async () => {
      const [records, savedSnapshot] = await Promise.all([
        consentStore.loadAll(userId),
        loadBaselineSnapshot(userId),
      ]);

      if (savedSnapshot) {
        snapshotRef.current = savedSnapshot;
      }

      setState(s => ({
        ...s,
        consentRecords: records,
        isReady: true,
      }));
    })();
  }, [userId]);

  // Signal ingestion loop — runs every 60s
  useEffect(() => {
    if (!state.isReady) return;

    const tick = async () => {
      const nowMs = Date.now();

      // Check consent before activating monitoring
      const consentGranted = state.consentRecords.some(
        r => r.userId === userId && r.feature === "behavioral_monitoring" && r.status === "GRANTED"
      );

      assertMonitoringRequiresConsent(true, consentGranted);
      if (!consentGranted) return;

      // Cold start evaluation
      const coldStart = evaluateColdStart(snapshotRef.current.firstSignalMs, nowMs);

      // Build a synthetic signal (real wearable/UI adapter would provide this)
      const signal: BehavioralSignal = {
        heartRateDelta: 0.1 + Math.random() * 0.1,
        sleepDeficitDelta: 0.05,
        activityDelta: 0.05,
        textVolumeRecent: 500,
        collectedAtMs: nowMs,
      };

      // Update snapshot (pure function, no mutation)
      snapshotRef.current = ingestSignal(snapshotRef.current, signal);

      // Compute risk (pure function)
      const riskScore = computeRiskScore(signal, snapshotRef.current.baseline);
      assertRiskScoreRange(riskScore);

      // Transition state (pure function)
      const result = transitionState(stateRef.current, riskScore, nowMs);
      stateRef.current = result.nextState;

      // Persist baseline
      await saveBaselineSnapshot(userId, snapshotRef.current);

      setState(s => ({
        ...s,
        behavioralState: result.nextState,
        riskScore,
        coldStartActive: coldStart.isActive,
      }));
    };

    const interval = setInterval(tick, 60_000);
    tick(); // immediate first run
    return () => clearInterval(interval);
  }, [userId, state.isReady, state.consentRecords]);

  const evaluateAction = useCallback(
    (action: string, isProtected = false): GateResult => {
      const result = evaluateGate({
        action,
        isProtectedAction: isProtected,
        behavioralState: stateRef.current,
        consentRecords: state.consentRecords,
        coldStartActive: state.coldStartActive,
      });

      assertColdStartGatesSuppressed(state.coldStartActive, result);
      return result;
    },
    [state.consentRecords, state.coldStartActive]
  );

  const revokeConsent = useCallback(
    async (feature: string) => {
      await consentStore.revoke(userId, feature);
      const updated = await consentStore.loadAll(userId);
      setState(s => ({ ...s, consentRecords: updated }));
    },
    [userId]
  );

  return { ...state, evaluateAction, revokeConsent };
}
