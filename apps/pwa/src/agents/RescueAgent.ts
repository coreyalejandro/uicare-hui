/**
 * RescueAgent
 * 
 * Targeted intervention agent that provides clear, actionable steps
 * when behavioral loops or crisis patterns are detected.
 * 
 * Never punitive, always precise. Neurodivergent-friendly framing.
 * 
 * Ported from uicare-system/aiService.js
 */

import type { BehavioralState } from '@uicare-hui/safety-core';
import type { LoopDetection } from './MonitorAgent';

export interface RescueConfig {
  /** Azure OpenAI endpoint */
  endpoint: string;
  /** API key */
  apiKey: string;
  /** Model deployment name */
  model: string;
}

export interface RescueStep {
  /** Step number */
  order: number;
  /** Action to take */
  action: string;
  /** Why this helps */
  rationale: string;
  /** Estimated time to complete */
  estimatedTime: string;
}

export interface RescueIntervention {
  /** Intervention title */
  title: string;
  /** Brief description */
  description: string;
  /** Specific steps to take */
  steps: RescueStep[];
  /** Urgency level */
  urgency: 'low' | 'medium' | 'high' | 'critical';
  /** Timestamp */
  timestamp: number;
}

export class RescueAgent {
  private config: RescueConfig;

  constructor(config: RescueConfig) {
    this.config = config;
  }

  /**
   * Generate rescue intervention based on behavioral state and loop detection
   */
  async generateIntervention(
    state: BehavioralState,
    loop: LoopDetection | null
  ): Promise<RescueIntervention> {
    // In production, this would call Azure OpenAI for personalized interventions
    // For now, using rule-based interventions

    if (state === 'CRISIS_ADJACENT') {
      return this.getCrisisIntervention();
    }

    if (state === 'ACUTE') {
      return this.getAcuteIntervention(loop);
    }

    if (state === 'HEIGHTENED') {
      return this.getHeightenedIntervention(loop);
    }

    if (state === 'ELEVATED') {
      return this.getElevatedIntervention(loop);
    }

    return this.getBaselineIntervention();
  }

  private getCrisisIntervention(): RescueIntervention {
    return {
      title: 'Take a Breath',
      description: 'Your patterns suggest you need a pause right now. This is not a judgment—it\'s a safety measure.',
      steps: [
        {
          order: 1,
          action: 'Step away from the screen',
          rationale: 'Physical distance helps interrupt the pattern',
          estimatedTime: '2 minutes',
        },
        {
          order: 2,
          action: 'Take 5 deep breaths',
          rationale: 'Activates your parasympathetic nervous system',
          estimatedTime: '1 minute',
        },
        {
          order: 3,
          action: 'Drink a glass of water',
          rationale: 'Physical grounding, gives your brain a reset',
          estimatedTime: '2 minutes',
        },
        {
          order: 4,
          action: 'Text someone you trust: "I\'m okay, just taking a break"',
          rationale: 'Creates accountability without requiring explanation',
          estimatedTime: '1 minute',
        },
      ],
      urgency: 'critical',
      timestamp: Date.now(),
    };
  }

  private getAcuteIntervention(loop: LoopDetection | null): RescueIntervention {
    const loopSpecific = loop?.detected
      ? `You've been in a ${loop.loopType} loop for ${(loop.duration / 1000 / 60).toFixed(1)} minutes.`
      : 'Your activity patterns have shifted significantly.';

    return {
      title: 'Pattern Detected',
      description: `${loopSpecific} Let's break the cycle.`,
      steps: [
        {
          order: 1,
          action: 'Save your work',
          rationale: 'Preserve what you\'ve done so far',
          estimatedTime: '30 seconds',
        },
        {
          order: 2,
          action: 'Close this tab/window',
          rationale: 'Remove the immediate trigger',
          estimatedTime: '10 seconds',
        },
        {
          order: 3,
          action: 'Do something physical for 5 minutes',
          rationale: 'Walk, stretch, or move to reset your state',
          estimatedTime: '5 minutes',
        },
        {
          order: 4,
          action: 'Ask yourself: "What was I trying to accomplish?"',
          rationale: 'Reconnect with your original intent',
          estimatedTime: '1 minute',
        },
      ],
      urgency: 'high',
      timestamp: Date.now(),
    };
  }

  private getHeightenedIntervention(loop: LoopDetection | null): RescueIntervention {
    return {
      title: 'Gentle Redirect',
      description: loop?.detected
        ? `You've been repeating a pattern. This is common—let's adjust.`
        : 'Your activity suggests you might benefit from a brief pause.',
      steps: [
        {
          order: 1,
          action: 'Pause for 30 seconds',
          rationale: 'Give yourself permission to stop',
          estimatedTime: '30 seconds',
        },
        {
          order: 2,
          action: 'Write down what you\'re trying to do',
          rationale: 'Externalizing helps clarify intent',
          estimatedTime: '2 minutes',
        },
        {
          order: 3,
          action: 'Is this the most important thing right now?',
          rationale: 'Check if you\'re on the right task',
          estimatedTime: '1 minute',
        },
      ],
      urgency: 'medium',
      timestamp: Date.now(),
    };
  }

  private getElevatedIntervention(loop: LoopDetection | null): RescueIntervention {
    return {
      title: 'Awareness Check',
      description: 'Just a gentle reminder to check in with yourself.',
      steps: [
        {
          order: 1,
          action: 'Take 3 deep breaths',
          rationale: 'Quick reset for your nervous system',
          estimatedTime: '30 seconds',
        },
        {
          order: 2,
          action: 'Notice how you\'re feeling',
          rationale: 'Awareness is the first step',
          estimatedTime: '30 seconds',
        },
      ],
      urgency: 'low',
      timestamp: Date.now(),
    };
  }

  private getBaselineIntervention(): RescueIntervention {
    return {
      title: 'All Good',
      description: 'Your patterns look stable. Keep going.',
      steps: [],
      urgency: 'low',
      timestamp: Date.now(),
    };
  }

  /**
   * Get intervention copy for specific behavioral state
   * (Used by InterventionBanner component)
   */
  getInterventionCopy(state: BehavioralState): {
    title: string;
    message: string;
    actionText: string;
  } {
    switch (state) {
      case 'CRISIS_ADJACENT':
        return {
          title: 'Safety Pause',
          message: 'We noticed a pattern. Take a breath. You can continue in a moment.',
          actionText: 'I understand',
        };
      case 'ACUTE':
        return {
          title: 'Pattern Detected',
          message: 'Your activity suggests you might benefit from a brief pause.',
          actionText: 'Show me steps',
        };
      case 'HEIGHTENED':
        return {
          title: 'Gentle Reminder',
          message: 'Just checking in—everything okay?',
          actionText: 'Yes, continue',
        };
      case 'ELEVATED':
        return {
          title: 'Awareness Check',
          message: 'Take a moment to notice how you\'re feeling.',
          actionText: 'Okay',
        };
      default:
        return {
          title: 'All Good',
          message: 'Your patterns look stable.',
          actionText: 'Continue',
        };
    }
  }
}

// Made with Bob
