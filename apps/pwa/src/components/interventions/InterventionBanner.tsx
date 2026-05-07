"use client";
/**
 * InterventionBanner — Non-clinical safety intervention display component.
 * Implements the InterventionDisplay port contract at the UI layer.
 *
 * WCAG 2.1 AA:
 * - role="alertdialog" for FIRM/HARD_BLOCK
 * - role="status" for SOFT
 * - All interactive elements keyboard accessible
 * - Reduced motion respected via prefers-reduced-motion
 * - Focus management: focusable on mount via ref
 * - No clinical language in any visible text
 */

import React, { forwardRef } from "react";
import type { InterventionLevel } from "@uicare-hui/safety-core";

interface InterventionBannerProps {
  level: InterventionLevel;
  reason: string;
  overrideAvailable: boolean;
  onOverride?: () => void;
  onGrounding: () => void;
  onDismiss?: () => void;
}

const MESSAGES: Record<InterventionLevel, string> = {
  SOFT: "A brief pause might feel good right now.",
  FIRM: "Let's take a moment before continuing.",
  HARD_BLOCK: "This is paused. Grounding support is ready when you are.",
};

const ACTION_LABELS: Record<InterventionLevel, string> = {
  SOFT: "I'm fine, continue",
  FIRM: "Take a break",
  HARD_BLOCK: "Open grounding support",
};

const STYLES: Record<InterventionLevel, string> = {
  SOFT: "bg-amber-50 border-amber-200 text-amber-900",
  FIRM: "bg-orange-50 border-orange-300 text-orange-900",
  HARD_BLOCK: "bg-red-50 border-red-400 text-red-900",
};

export const InterventionBanner = forwardRef<HTMLDivElement, InterventionBannerProps>(
  function InterventionBanner(
    { level, reason: _reason, overrideAvailable, onOverride, onGrounding, onDismiss },
    ref
  ) {
    const isModal = level === "FIRM" || level === "HARD_BLOCK";
    const message = MESSAGES[level];
    const actionLabel = ACTION_LABELS[level];

    return (
      <div
        ref={ref}
        role={isModal ? "alertdialog" : "status"}
        aria-live={isModal ? "assertive" : "polite"}
        aria-label={`Behavioral support: ${message}`}
        tabIndex={-1}
        className={`
          relative z-50 p-4 rounded-lg border-2 shadow-md
          motion-safe:animate-fade-in
          ${STYLES[level]}
        `}
      >
        <p className="text-sm font-medium leading-relaxed">{message}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onGrounding}
            className="px-4 py-2 rounded-md text-sm font-semibold bg-white border border-current
                       hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-2
                       focus-visible:ring-current transition-colors"
          >
            {actionLabel}
          </button>

          {overrideAvailable && onOverride && level !== "HARD_BLOCK" && (
            <button
              type="button"
              onClick={onOverride}
              className="px-4 py-2 rounded-md text-sm text-current/70
                         hover:text-current focus-visible:ring-2 focus-visible:ring-current
                         underline-offset-2 hover:underline transition-colors"
              aria-label="Override safety gate — your choice is respected"
            >
              I'd rather continue
            </button>
          )}

          {onDismiss && level === "SOFT" && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss this notice"
              className="absolute top-2 right-2 p-1 rounded hover:bg-black/10
                         focus-visible:ring-2 focus-visible:ring-current"
            >
              <span aria-hidden="true" className="text-lg leading-none">×</span>
            </button>
          )}
        </div>
      </div>
    );
  }
);
