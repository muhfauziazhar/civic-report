import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import { CATEGORIES, ReportStore, isValidStatus, validateReportInput } from './reports.js';
import type { Category, Status } from './reports.js';

// ponytail: in-memory fixed-window rate limit — swap for a shared store when running >1 instance
function rateLimit(max: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = req.ip ?? 'unknown';
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      if (hits.size > 10_000) hits.clear();
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (++entry.count > max) {
      return res.status(429).json({ errors: [{ field: 'request', message: 'Too many requests, try again shortly' }] });
    }
    next();
  };
}

export function createApp(store = new ReportStore()) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', true);

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
    );
    next();
  });

  app.use(express.json({ limit: '50kb' }));
  app.use('/api', rateLimit(100, 60_000));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/categories', (_req, res) => {
    res.json(CATEGORIES);
  });

  app.get('/api/reports', (req, res) => {
    const { category, status } = req.query;
    if (category !== undefined && !CATEGORIES.includes(category as Category)) {
      return res.status(400).json({ errors: [{ field: 'category', message: 'Unknown category' }] });
    }
    if (status !== undefined && !isValidStatus(status)) {
      return res.status(400).json({ errors: [{ field: 'status', message: 'Unknown status' }] });
    }
    res.json(store.list({ category: category as Category, status: status as Status }));
  });

  app.post('/api/reports', (req, res) => {
    const { input, errors } = validateReportInput(req.body);
    if (!input) return res.status(400).json({ errors });
    res.status(201).json(store.create(input));
  });

  app.get('/api/reports/:id', (req, res) => {
    const report = store.get(Number(req.params.id));
    if (!report) return res.status(404).json({ errors: [{ field: 'id', message: 'Report not found' }] });
    res.json(report);
  });

  app.patch('/api/reports/:id/status', (req, res) => {
    const { status } = req.body ?? {};
    if (!isValidStatus(status)) {
      return res.status(400).json({ errors: [{ field: 'status', message: 'Status must be open, in_progress or resolved' }] });
    }
    const report = store.updateStatus(Number(req.params.id), status);
    if (!report) return res.status(404).json({ errors: [{ field: 'id', message: 'Report not found' }] });
    res.json(report);
  });

  // Unknown API routes get JSON, not the SPA fallback
  app.use('/api', (_req, res) => {
    res.status(404).json({ errors: [{ field: 'path', message: 'Not found' }] });
  });

  // JSON error handler — malformed body etc. never leak stack traces
  app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status ?? 500;
    if (status >= 500) console.error(err);
    res.status(status).json({
      errors: [{ field: 'request', message: status < 500 ? 'Invalid request body' : 'Internal server error' }],
    });
  });

  return app;
}
