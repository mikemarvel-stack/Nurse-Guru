import { Router } from 'express';
import { register, collectDefaultMetrics, Counter, Histogram } from 'prom-client';

const router = Router();

// Collect default metrics
collectDefaultMetrics({ prefix: 'nurse_guru_' });

// Custom metrics
export const httpRequestDuration = new Histogram({
  name: 'nurse_guru_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestTotal = new Counter({
  name: 'nurse_guru_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Metrics endpoint
router.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

export default router;
