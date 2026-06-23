# Mania Monitoring

This document outlines how to configure wearable sensors for detecting early signs of manic episodes.

## Sensor Setup

1. **Heart Rate Monitor**
   - Use a wearable that records continuous heart rate.
   - Pair the device with the application following the manufacturer's instructions.
2. **Sleep Tracker**
   - Enable sleep tracking for nightly duration and quality.
   - Ensure the device is charged before sleep each night.
3. **Activity Tracker**
   - Track step count or active minutes throughout the day.
   - Calibrate stride length if the device supports it.

## Calibration

1. Collect baseline data for **at least seven days** while the user is in a stable mood.
2. During calibration, remind the user to wear devices consistently.
3. Baselines are computed as the average heart rate, sleep hours, and activity level over the calibration period.
4. After calibration, the system compares daily readings against these baselines to compute a mania risk score.

## Ongoing Monitoring

- Metrics are sampled at the start of each session and periodically thereafter.
- Significant increases in heart rate or activity coupled with reduced sleep can trigger alerts and route the user to crisis-support resources.

## Troubleshooting

- If sensors fail to sync, ensure Bluetooth is enabled and the device batteries are charged.
- Re-run calibration if the user's baseline changes due to medication or lifestyle adjustments.
