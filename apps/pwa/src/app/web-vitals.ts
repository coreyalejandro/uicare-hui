import type { NextWebVitalsMetric } from "next/app";

export function reportWebVitals(metric: NextWebVitalsMetric) {
  if (metric.label === "web-vital") {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value}`);
  }
}

