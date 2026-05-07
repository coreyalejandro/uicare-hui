"use client";
/**
 * BehavioralGate — Primary Safety UI Adapter
 * Implements the InterventionDisplay port concept at the React layer.
 *
 * Renders different gate levels based on core gate decisions.
 * All copy is non-clinical. Emergency exits are never blocked.
 * Fully keyboard accessible. WCAG 2.1 AA compliant.
 *
 * This is a PRIMARY ADAPTER: the core's gate decision flows
 * into this component, which calls the InterventionDisplay port.
 */

import React, { useCallback, useRef, useEffect } from "react";
import type { GateResult } from "@uicare-hui/safety-core";
import { InterventionBanner } from "./InterventionBanner.js";

interface BehavioralGateProps {
  gateResult: GateResult;
  /** The action the user attempted. Shown only to developers in console. */
  actionAttempted: string;
  onOverride: () => void;
  onGrounding: () => void;
  onDismiss: () => void;
  children: React.ReactNode;
}

export function BehavioralGate({
  gateResult,
  actionAttempted: _actionAttempted,
  onOverride,
  onGrounding,
  onDismiss,
  children,
}: BehavioralGateProps) {
  const bannerRef = useRef<HTMLDivElement>(null);

  // Move focus to intervention banner when it appears
  useEffect(() => {
    if (gateResult.decision !== "ALLOW" && bannerRef.current) {
      bannerRef.current.focus();
    }
  }, [gateResult.decision]);

  if (gateResult.decision === "ALLOW") {
    return <>{children}</>;
  }

  // HARD_BLOCK: render children as inert overlay
  const isBlocking = gateResult.decision === "HARD_BLOCK";

  return (
    <div
      className="relative"
      aria-live="assertive"
      aria-atomic="true"
    >
      {isBlocking && (
        <div
          className="absolute inset-0 z-40 bg-background/60 backdrop-blur-sm"
          aria-hidden="true"
        />
      )}

      <div aria-hidden={isBlocking} inert={isBlocking ? "" as unknown as boolean : undefined}>
        {children}
      </div>

      <InterventionBanner
        ref={bannerRef}
        level={gateResult.interventionLevel ?? "SOFT"}
        reason={gateResult.reason}
        overrideAvailable={gateResult.overrideAvailable}
        onOverride={onOverride}
        onGrounding={onGrounding}
        onDismiss={isBlocking ? undefined : onDismiss}
      />
    </div>
  );
}
