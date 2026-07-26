import express from 'express';
import { CATEGORIES, ReportStore, isValidStatus, validateReportInput } from './reports.js';
import type { Category, Status } from './reports.js';

export function createApp(store = new ReportStore()) {
  const app = express();
  app.use(express.json());

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

  return app;
}
