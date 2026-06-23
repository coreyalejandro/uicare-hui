/**
 * AbsenceDetector
 * 
 * Core innovation of UICare HUI: Detecting what users are NOT doing.
 * 
 * This processor analyzes vision signals to identify behavioral absence -
 * the most reliable predictor of mood state and behavioral crisis.
 * 
 * Key insight: It's not what the user IS doing that matters,
 * it's what they've STOPPED doing.
 */

import type { VisionSignal, VisionBaseline, GazePattern, MovementPattern, ObjectInteraction } from '../ports/VisionCollector';

export interface AbsencePattern {
  /** Type of absence detected */
  type: 'gaze_avoidance' | 'movement_cessation' | 'interaction_absence' | 'routine_break';
  /** Severity of absence (0-1) */
  severity: number;
  /** Description of what's absent */
  description: string;
  /** Duration of absence in milliseconds */
  duration: number;
  /** Confidence in detection (0-1) */
  confidence: number;
}

export interface AbsenceDetectionResult {
  /** Detected absence patterns */
  patterns: AbsencePattern[];
  /** Overall absence score (0-1) */
  overallScore: number;
  /** Contributing factors */
  factors: {
    gazeAvoidance: number;
    movementCessation: number;
    interactionAbsence: number;
    routineBreak: number;
  };
  /** Timestamp of detection */
  timestamp: number;
}

/**
 * Detects gaze avoidance patterns
 * 
 * User is looking at something but their body is positioned away from it,
 * or they're avoiding looking at something they normally interact with.
 */
function detectGazeAvoidance(
  gaze: GazePattern | null,
  baseline: VisionBaseline
): AbsencePattern | null {
  if (!gaze) return null;

  // Check if user is avoiding a typical gaze area
  const typicalAreas = baseline.typicalGazeAreas;
  let maxAvoidance = 0;
  let avoidedArea: { x: number; y: number } | null = null;

  for (const area of typicalAreas) {
    const distance = Math.sqrt(
      Math.pow(gaze.focusPoint.x - area.x, 2) +
      Math.pow(gaze.focusPoint.y - area.y, 2)
    );
    
    // If user typically looks at this area but is now avoiding it
    if (distance > 0.3 && area.frequency > 0.5) {
      const avoidanceScore = area.frequency * distance;
      if (avoidanceScore > maxAvoidance) {
        maxAvoidance = avoidanceScore;
        avoidedArea = area;
      }
    }
  }

  // Check for body-gaze mismatch (looking but body turned away)
  if (gaze.avoidancePoint) {
    const gazeDistance = Math.sqrt(
      Math.pow(gaze.focusPoint.x - gaze.avoidancePoint.x, 2) +
      Math.pow(gaze.focusPoint.y - gaze.avoidancePoint.y, 2)
    );
    
    if (gazeDistance > 0.4) {
      return {
        type: 'gaze_avoidance',
        severity: Math.min(gazeDistance, 1.0),
        description: 'User is looking at an area their body is avoiding',
        duration: gaze.fixationDuration,
        confidence: 0.8,
      };
    }
  }

  if (maxAvoidance > 0.3 && avoidedArea) {
    return {
      type: 'gaze_avoidance',
      severity: Math.min(maxAvoidance, 1.0),
      description: `User is avoiding a typically-viewed area at (${avoidedArea.x.toFixed(2)}, ${avoidedArea.y.toFixed(2)})`,
      duration: Date.now() - gaze.timestamp,
      confidence: 0.7,
    };
  }

  return null;
}

/**
 * Detects movement cessation
 * 
 * User has stopped moving in ways they typically do,
 * or micro-movements have changed significantly.
 */
function detectMovementCessation(
  movement: MovementPattern | null,
  baseline: VisionBaseline
): AbsencePattern | null {
  if (!movement) return null;

  // Check for absent expected movements
  if (movement.absentMovements.length > 0) {
    const severity = Math.min(movement.absentMovements.length / 5, 1.0);
    return {
      type: 'movement_cessation',
      severity,
      description: `Expected movements not occurring: ${movement.absentMovements.join(', ')}`,
      duration: Date.now() - movement.timestamp,
      confidence: 0.75,
    };
  }

  // Check for abnormal micro-movement patterns
  // Increased micro-movements can indicate anxiety/mania
  // Decreased can indicate depression/dissociation
  const typicalMicroMovements = 10; // Baseline average (would be calculated from baseline)
  const microMovementDelta = Math.abs(movement.microMovements - typicalMicroMovements);
  
  if (microMovementDelta > 5) {
    return {
      type: 'movement_cessation',
      severity: Math.min(microMovementDelta / 10, 1.0),
      description: movement.microMovements > typicalMicroMovements
        ? 'Increased micro-movements detected (possible anxiety/mania)'
        : 'Decreased micro-movements detected (possible depression/dissociation)',
      duration: Date.now() - movement.timestamp,
      confidence: 0.65,
    };
  }

  // Check for abnormally low velocity (user is frozen/still)
  if (movement.velocity < 5 && baseline.typicalMovements.length > 0) {
    return {
      type: 'movement_cessation',
      severity: 0.6,
      description: 'User movement has significantly decreased',
      duration: Date.now() - movement.timestamp,
      confidence: 0.7,
    };
  }

  return null;
}

/**
 * Detects interaction absence
 * 
 * User is not interacting with objects they typically interact with,
 * or is avoiding objects they normally use.
 */
function detectInteractionAbsence(
  objects: ObjectInteraction[],
  baseline: VisionBaseline
): AbsencePattern | null {
  if (objects.length === 0 && baseline.typicalInteractions.length > 0) {
    return {
      type: 'interaction_absence',
      severity: 0.7,
      description: 'User is not interacting with any typical objects',
      duration: 0,
      confidence: 0.6,
    };
  }

  // Check for expected interactions that are absent
  const absentInteractions = objects.filter(obj => obj.expectedButAbsent);
  if (absentInteractions.length > 0) {
    const severity = Math.min(absentInteractions.length / 3, 1.0);
    return {
      type: 'interaction_absence',
      severity,
      description: `Expected interactions not occurring with: ${absentInteractions.map(o => o.objectId).join(', ')}`,
      duration: Math.max(...absentInteractions.map(o => o.duration)),
      confidence: 0.75,
    };
  }

  // Check for avoidance of typical objects
  const avoidedObjects = objects.filter(obj => obj.interactionType === 'avoid');
  const typicallyUsedButAvoided = avoidedObjects.filter(obj =>
    baseline.typicalInteractions.some(ti => ti.objectId === obj.objectId && ti.frequency > 0.5)
  );

  if (typicallyUsedButAvoided.length > 0) {
    return {
      type: 'interaction_absence',
      severity: 0.8,
      description: `User is avoiding typically-used objects: ${typicallyUsedButAvoided.map(o => o.objectId).join(', ')}`,
      duration: Math.max(...typicallyUsedButAvoided.map(o => o.duration)),
      confidence: 0.8,
    };
  }

  return null;
}

/**
 * Detects routine breaks
 * 
 * User's overall pattern has deviated from their established baseline.
 */
function detectRoutineBreak(
  signal: VisionSignal,
  baseline: VisionBaseline
): AbsencePattern | null {
  // If baseline is not established, can't detect routine break
  if (baseline.sampleCount < 10) return null;

  // Check how long since baseline was last updated
  const timeSinceUpdate = Date.now() - baseline.lastUpdated;
  const hoursSinceUpdate = timeSinceUpdate / (1000 * 60 * 60);

  // If user hasn't been seen in their typical patterns for > 6 hours
  if (hoursSinceUpdate > 6) {
    return {
      type: 'routine_break',
      severity: Math.min(hoursSinceUpdate / 24, 1.0),
      description: `User has not followed typical patterns for ${hoursSinceUpdate.toFixed(1)} hours`,
      duration: timeSinceUpdate,
      confidence: 0.7,
    };
  }

  return null;
}

/**
 * Main absence detection function
 * 
 * Analyzes vision signal against baseline to detect behavioral absence.
 */
export function detectAbsence(
  signal: VisionSignal,
  baseline: VisionBaseline
): AbsenceDetectionResult {
  const patterns: AbsencePattern[] = [];

  // Detect each type of absence
  const gazeAvoidance = detectGazeAvoidance(signal.gaze, baseline);
  if (gazeAvoidance) patterns.push(gazeAvoidance);

  const movementCessation = detectMovementCessation(signal.movement, baseline);
  if (movementCessation) patterns.push(movementCessation);

  const interactionAbsence = detectInteractionAbsence(signal.objects, baseline);
  if (interactionAbsence) patterns.push(interactionAbsence);

  const routineBreak = detectRoutineBreak(signal, baseline);
  if (routineBreak) patterns.push(routineBreak);

  // Calculate factor scores
  const factors = {
    gazeAvoidance: gazeAvoidance?.severity ?? 0,
    movementCessation: movementCessation?.severity ?? 0,
    interactionAbsence: interactionAbsence?.severity ?? 0,
    routineBreak: routineBreak?.severity ?? 0,
  };

  // Calculate overall absence score (weighted average)
  const weights = {
    gazeAvoidance: 0.3,
    movementCessation: 0.25,
    interactionAbsence: 0.3,
    routineBreak: 0.15,
  };

  const overallScore = 
    factors.gazeAvoidance * weights.gazeAvoidance +
    factors.movementCessation * weights.movementCessation +
    factors.interactionAbsence * weights.interactionAbsence +
    factors.routineBreak * weights.routineBreak;

  return {
    patterns,
    overallScore: Math.min(overallScore, 1.0),
    factors,
    timestamp: Date.now(),
  };
}

/**
 * Convert absence detection result to behavioral signal
 * 
 * Maps vision-based absence detection to the behavioral signal format
 * expected by the safety-core risk scorer.
 */
export function absenceToSignal(detection: AbsenceDetectionResult): {
  activityDelta: number;
  textVolumeRecent: number;
  timestamp: number;
} {
  // Map absence score to activity delta
  // Higher absence = lower activity
  const activityDelta = -detection.overallScore * 50;

  // Absence patterns don't directly map to text volume,
  // but we can infer from interaction absence
  const textVolumeRecent = detection.factors.interactionAbsence > 0.5 ? 0 : 1000;

  return {
    activityDelta,
    textVolumeRecent,
    timestamp: detection.timestamp,
  };
}

// Made with Bob
