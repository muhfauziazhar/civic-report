import express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createApp } from './app.js';

// Outer app so the request logger runs before every route in createApp()
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);

// Minimal structured request log — one line per request
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(JSON.stringify({ method: req.method, path: req.path, status: res.statusCode, ms: Date.now() - start }));
  });
  next();
});

app.use(createApp());

// In the Docker image the built frontend sits next to dist/
const webDist = join(import.meta.dirname, '..', 'public');
if (existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get('*', (_req, res) => res.sendFile(join(webDist, 'index.html')));
}

const port = Number(process.env.PORT ?? 3001);
const server = app.listen(port, () => {
  console.log(`CivicReport listening on http://localhost:${port}`);
});

// Graceful shutdown: stop accepting connections, drain, then exit
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    console.log(`${signal} received, shutting down`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  });
}
