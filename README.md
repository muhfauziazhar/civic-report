# CivicReport — Accessible Public Issue Reporting Portal

A small but production-shaped full stack app built to demonstrate **test-first engineering** and **accessibility (WCAG 2.2 AA)** for public-sector web applications.

Citizens report local issues (potholes, broken street lights, waste problems); staff track status. The interesting part is not the feature set — it's how quality is engineered into every layer.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Unit / integration tests | Vitest, Supertest |
| Component tests | Testing Library + user-event |
| E2E tests | Playwright |
| Accessibility tests | Axe Core (`@axe-core/playwright`), WCAG 2.2 AA ruleset |
| CI/CD | GitHub Actions (typecheck → unit → component → e2e/a11y → Docker build) |
| Deployment | Multi-stage Dockerfile, single container |

## Test pyramid

```
        e2e/tests/            6 Playwright tests
          ├─ report-flow      full user journeys incl. keyboard-only
          └─ accessibility    Axe scans of default / error / success states
        web/src/**/*.test.tsx 4 component tests (form validation UX, focus management)
        server/test/          16 unit + integration tests (validation, store, HTTP API)
```

Run everything:

```bash
npm install
npm test          # server unit+integration, web component tests
npm run test:e2e  # Playwright starts both dev servers itself
```

## Accessibility engineering (not just an Axe scan)

- **Error summary pattern** (GOV.UK style): on invalid submit, focus moves to a `role="alert"` summary; each error links to its field.
- Inline errors tied to inputs via `aria-describedby` + `aria-invalid`.
- Fully keyboard operable — covered by a dedicated e2e test.
- Skip link, semantic landmarks, table with `caption`/`scope`, `role="status"` for the success banner.
- Visible focus indicators, ≥44px touch targets, ≥4.5:1 contrast.
- Axe Core scans **all three UI states** (default, error, success) against `wcag2a, wcag2aa, wcag21aa, wcag22aa` in CI.

## Run locally

```bash
npm install
npm run dev   # API on :3001, web on :5173 (proxied)
```

## Docker

```bash
docker build -t civic-report .
docker run -p 3001:3001 civic-report   # serves API + built frontend
```

## Docs

- [API specification](docs/API.md)
- [Architecture & decisions](docs/ARCHITECTURE.md)

## Deliberate scope cuts

In-memory store (no DB), no auth, no pagination — the focus of this showcase is testing culture, a11y, and delivery pipeline. Each cut is marked in code with a `ponytail:` comment naming the upgrade path.
