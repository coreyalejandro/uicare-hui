export interface WearableMetrics {
  heartRate: number; // beats per minute
  sleepHours: number; // hours slept last night
  activity: number; // activity level (e.g., step count)
}

let baseline: WearableMetrics | null = null;
let samples = 0;

function ingestMetrics(metrics: WearableMetrics) {
  if (!baseline) {
    baseline = { ...metrics };
    samples = 1;
    return;
  }
  samples += 1;
  baseline.heartRate += (metrics.heartRate - baseline.heartRate) / samples;
  baseline.sleepHours += (metrics.sleepHours - baseline.sleepHours) / samples;
  baseline.activity += (metrics.activity - baseline.activity) / samples;
}

function computeRisk(metrics: WearableMetrics): number {
  if (!baseline) {
    ingestMetrics(metrics);
    return 0;
  }
  const hrDelta = (metrics.heartRate - baseline.heartRate) / baseline.heartRate;
  const sleepDelta = (baseline.sleepHours - metrics.sleepHours) / baseline.sleepHours;
  const activityDelta = (metrics.activity - baseline.activity) / baseline.activity;

  const score =
    Math.max(0, hrDelta) * 0.33 +
    Math.max(0, sleepDelta) * 0.34 +
    Math.max(0, activityDelta) * 0.33;

  return Math.min(1, score);
}

async function readWearableMetrics(): Promise<WearableMetrics> {
  // Placeholder for real wearable integration.
  // In a production environment, replace with device APIs.
  return {
    heartRate: 60 + Math.random() * 40,
    sleepHours: 6 + Math.random() * 2,
    activity: 4000 + Math.random() * 2000,
  };
}

export async function getManiaRisk(metrics?: WearableMetrics): Promise<number> {
  const data = metrics || (await readWearableMetrics());
  const risk = computeRisk(data);
  ingestMetrics(data);
  return risk;
}
