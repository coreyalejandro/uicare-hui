# Performance Metrics

The application tracks [Web Vitals](https://web.dev/vitals/) using Next.js' built-in
`reportWebVitals` hook. The following thresholds are monitored:

- **Largest Contentful Paint (LCP):** < 2.5s
- **First Input Delay (FID):** < 100ms
- **Cumulative Layout Shift (CLS):** < 0.1
- **Time to First Byte (TTFB):** < 800ms

Values exceeding these thresholds should be investigated to maintain a smooth
user experience.

