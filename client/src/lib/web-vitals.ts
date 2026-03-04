import { onCLS, onFID, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  // Send to your analytics endpoint
  const body = JSON.stringify(metric);
  const url = '/api/analytics/vitals';

  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, { body, method: 'POST', keepalive: true }).catch(console.error);
  }

  // Log in development
  if (import.meta.env.DEV) {
    console.log('[Web Vitals]', metric.name, metric.value, metric.rating);
  }
}

export function reportWebVitals() {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
