import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const valid = {
  title: 'Pothole on main road',
  category: 'roads',
  location: 'Jalan Malioboro 5',
  description: 'Deep pothole near the crossing',
};

describe('CivicReport API', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request(createApp()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /api/categories returns the category list', async () => {
    const res = await request(createApp()).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body).toContain('roads');
  });

  it('POST /api/reports creates a report', async () => {
    const app = createApp();
    const res = await request(app).post('/api/reports').send(valid);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 1, status: 'open', ...valid });
    expect(res.body.createdAt).toBeTruthy();
  });

  it('POST /api/reports returns 400 with field errors for invalid input', async () => {
    const res = await request(createApp()).post('/api/reports').send({ title: '' });
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
    expect(res.body.errors[0]).toHaveProperty('field');
    expect(res.body.errors[0]).toHaveProperty('message');
  });

  it('GET /api/reports lists created reports, supports filtering', async () => {
    const app = createApp();
    await request(app).post('/api/reports').send(valid);
    await request(app).post('/api/reports').send({ ...valid, category: 'waste' });

    const all = await request(app).get('/api/reports');
    expect(all.body).toHaveLength(2);

    const waste = await request(app).get('/api/reports?category=waste');
    expect(waste.body).toHaveLength(1);

    const bad = await request(app).get('/api/reports?category=nope');
    expect(bad.status).toBe(400);
  });

  it('GET /api/reports/:id returns 404 for unknown report', async () => {
    const res = await request(createApp()).get('/api/reports/999');
    expect(res.status).toBe(404);
  });

  it('PATCH /api/reports/:id/status updates status, validates value', async () => {
    const app = createApp();
    await request(app).post('/api/reports').send(valid);

    const ok = await request(app).patch('/api/reports/1/status').send({ status: 'resolved' });
    expect(ok.status).toBe(200);
    expect(ok.body.status).toBe('resolved');

    const bad = await request(app).patch('/api/reports/1/status').send({ status: 'done' });
    expect(bad.status).toBe(400);

    const missing = await request(app).patch('/api/reports/99/status').send({ status: 'resolved' });
    expect(missing.status).toBe(404);
  });
});
