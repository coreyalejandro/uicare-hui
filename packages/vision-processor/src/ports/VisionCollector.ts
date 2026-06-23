/**
 * VisionCollector Port
 * 
 * Port interface for collecting vision-based behavioral signals.
 * Enables "reading the room" - detecting what users are NOT doing
 * through webcam monitoring and spatial behavior analysis.
 * 
 * Part of UICare HUI's hexagonal architecture.
 */

export interface GazePattern {
  /** Area user is looking at (normalized coordinates 0-1) */
  focusPoint: { x: number; y: number };
  /** Area user's body is avoiding (normalized coordinates 0-1) */
  avoidancePoint: { x: number; y: number } | null;
  /** Duration of gaze fixation in milliseconds */
  fixationDuration: number;
  /** Timestamp of observation */
  timestamp: number;
}

export interface MovementPattern {
  /** Current body position (normalized coordinates) */
  position: { x: number; y: number };
  /** Movement velocity (pixels per second) */
  velocity: number;
  /** Micro-movements detected (tremor, fidgeting) */
  microMovements: number;
  /** Expected movements that are absent */
  absentMovements: string[];
  /** Timestamp of observation */
  timestamp: number;
}

export interface ObjectInteraction {
  /** Object being interacted with (or avoided) */
  objectId: string;
  /** Type of interaction: 'touch' | 'avoid' | 'watch' | 'ignore' */
  interactionType: 'touch' | 'avoid' | 'watch' | 'ignore';
  /** Duration of interaction/avoidance in milliseconds */
  duration: number;
  /** Expected interaction that didn't occur */
  expectedButAbsent: boolean;
  /** Timestamp of observation */
  timestamp: number;
}

export interface VisionSignal {
  /** Gaze tracking data */
  gaze: GazePattern | null;
  /** Movement pattern data */
  movement: MovementPattern | null;
  /** Object interaction data */
  objects: ObjectInteraction[];
  /** Overall absence score (0-1, higher = more absent behaviors) */
  absenceScore: number;
  /** Timestamp of signal collection */
  timestamp: number;
}

export interface VisionBaseline {
  /** User's typical gaze patterns */
  typicalGazeAreas: Array<{ x: number; y: number; frequency: number }>;
  /** User's typical movement patterns */
  typicalMovements: string[];
  /** User's typical object interactions */
  typicalInteractions: Array<{ objectId: string; frequency: number }>;
  /** Number of samples in baseline */
  sampleCount: number;
  /** When baseline was last updated */
  lastUpdated: number;
}

/**
 * VisionCollector Port Interface
 * 
 * Adapters must implement this interface to provide vision-based
 * behavioral signals to the safety core.
 */
export interface VisionCollector {
  /**
   * Initialize vision monitoring with user consent
   * @param userId - User identifier
   * @param consentGranted - Whether user granted webcam access
   * @returns Promise resolving to initialization success
   */
  initialize(userId: string, consentGranted: boolean): Promise<boolean>;

  /**
   * Start collecting vision signals
   * @returns Promise resolving when collection starts
   */
  startCollection(): Promise<void>;

  /**
   * Stop collecting vision signals
   * @returns Promise resolving when collection stops
   */
  stopCollection(): Promise<void>;

  /**
   * Get current vision signal
   * @returns Current vision signal or null if not available
   */
  getCurrentSignal(): VisionSignal | null;

  /**
   * Get user's vision baseline
   * @returns User's baseline or null if not established
   */
  getBaseline(): VisionBaseline | null;

  /**
   * Update user's vision baseline with new sample
   * @param signal - Vision signal to incorporate into baseline
   * @returns Updated baseline
   */
  updateBaseline(signal: VisionSignal): VisionBaseline;

  /**
   * Check if vision monitoring is active
   * @returns True if actively collecting signals
   */
  isActive(): boolean;

  /**
   * Get last error if any
   * @returns Error message or null
   */
  getLastError(): string | null;
}

/**
 * Null Vision Collector
 * 
 * Fallback implementation when vision capabilities are not available
 * or user has not granted webcam access.
 */
export class NullVisionCollector implements VisionCollector {
  async initialize(): Promise<boolean> {
    return false;
  }

  async startCollection(): Promise<void> {
    // No-op
  }

  async stopCollection(): Promise<void> {
    // No-op
  }

  getCurrentSignal(): VisionSignal | null {
    return null;
  }

  getBaseline(): VisionBaseline | null {
    return null;
  }

  updateBaseline(): VisionBaseline {
    return {
      typicalGazeAreas: [],
      typicalMovements: [],
      typicalInteractions: [],
      sampleCount: 0,
      lastUpdated: Date.now(),
    };
  }

  isActive(): boolean {
    return false;
  }

  getLastError(): string | null {
    return 'Vision monitoring not available';
  }
}

// Made with Bob
