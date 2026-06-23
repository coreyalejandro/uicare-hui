/**
 * MonitorAgent
 * 
 * Continuous behavioral analysis agent that detects repetitive interaction
 * loops and behavioral deviation from user's authenticated baseline.
 * 
 * Ported from uicare-system/aiService.js
 */

import type { BehavioralSignal } from '@uicare-hui/safety-core';

export interface MonitorConfig {
  /** Azure OpenAI endpoint */
  endpoint: string;
  /** API key */
  apiKey: string;
  /** Model deployment name */
  model: string;
  /** Monitoring interval in milliseconds */
  interval: number;
}

export interface LoopDetection {
  /** Whether a loop was detected */
  detected: boolean;
  /** Type of loop */
  loopType: 'edit-revert' | 'navigation' | 'decision' | 'text-entry' | null;
  /** Duration of loop in milliseconds */
  duration: number;
  /** Confidence in detection (0-1) */
  confidence: number;
  /** Description of the loop */
  description: string;
}

export class MonitorAgent {
  private config: MonitorConfig;
  private activityHistory: Array<{ action: string; timestamp: number }> = [];
  private isMonitoring: boolean = false;
  private monitorInterval: NodeJS.Timeout | null = null;

  constructor(config: MonitorConfig) {
    this.config = config;
  }

  /**
   * Start monitoring user activity
   */
  start(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitorInterval = setInterval(() => {
      this.analyzeActivity();
    }, this.config.interval);
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    this.isMonitoring = false;
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
  }

  /**
   * Record user activity
   */
  recordActivity(action: string): void {
    this.activityHistory.push({
      action,
      timestamp: Date.now(),
    });

    // Keep only last 100 actions
    if (this.activityHistory.length > 100) {
      this.activityHistory.shift();
    }
  }

  /**
   * Analyze recent activity for loops
   */
  private async analyzeActivity(): Promise<LoopDetection> {
    if (this.activityHistory.length < 5) {
      return {
        detected: false,
        loopType: null,
        duration: 0,
        confidence: 0,
        description: 'Insufficient activity history',
      };
    }

    // Simple pattern detection (would use AI in production)
    const recentActions = this.activityHistory.slice(-20);
    const loopDetection = this.detectSimpleLoop(recentActions);

    return loopDetection;
  }

  /**
   * Simple loop detection without AI
   * (Production would use Azure OpenAI for sophisticated analysis)
   */
  private detectSimpleLoop(
    actions: Array<{ action: string; timestamp: number }>
  ): LoopDetection {
    // Detect edit-revert loops
    const editRevertPattern = /edit.*revert|undo.*redo/i;
    const editRevertCount = actions.filter(a => 
      editRevertPattern.test(a.action)
    ).length;

    if (editRevertCount >= 3) {
      const duration = actions[actions.length - 1].timestamp - actions[0].timestamp;
      return {
        detected: true,
        loopType: 'edit-revert',
        duration,
        confidence: 0.8,
        description: `User has performed ${editRevertCount} edit-revert cycles in ${(duration / 1000).toFixed(0)}s`,
      };
    }

    // Detect navigation loops
    const navigationPattern = /navigate|click|scroll/i;
    const navigationActions = actions.filter(a => navigationPattern.test(a.action));
    
    if (navigationActions.length >= 10) {
      const uniqueTargets = new Set(navigationActions.map(a => a.action));
      if (uniqueTargets.size <= 3) {
        const duration = actions[actions.length - 1].timestamp - actions[0].timestamp;
        return {
          detected: true,
          loopType: 'navigation',
          duration,
          confidence: 0.7,
          description: `User is cycling between ${uniqueTargets.size} locations repeatedly`,
        };
      }
    }

    return {
      detected: false,
      loopType: null,
      duration: 0,
      confidence: 0,
      description: 'No loops detected',
    };
  }

  /**
   * Get current monitoring status
   */
  getStatus(): {
    isMonitoring: boolean;
    activityCount: number;
    lastActivity: string | null;
  } {
    return {
      isMonitoring: this.isMonitoring,
      activityCount: this.activityHistory.length,
      lastActivity: this.activityHistory.length > 0
        ? this.activityHistory[this.activityHistory.length - 1].action
        : null,
    };
  }

  /**
   * Convert loop detection to behavioral signal
   */
  loopToSignal(loop: LoopDetection): Partial<BehavioralSignal> {
    if (!loop.detected) {
      return {
        activityDelta: 0,
        textVolumeRecent: 0,
      };
    }

    // Loops indicate elevated activity but potentially impaired judgment
    const activityDelta = loop.confidence * 30;
    const textVolumeRecent = loop.loopType === 'text-entry' ? 5000 : 1000;

    return {
      activityDelta,
      textVolumeRecent,
    };
  }
}
