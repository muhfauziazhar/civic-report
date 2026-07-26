import express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createApp } from './app.js';

const app = createApp();

// In the Docker image the built frontend sits next to dist/
const webDist = join(import.meta.dirname, '..', 'public');
if (existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get('*', (_req, res) => res.sendFile(join(webDist, 'index.html')));
}

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`CivicReport listening on http://localhost:${port}`);
});
