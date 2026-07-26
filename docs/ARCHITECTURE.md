# Architecture & Decisions

```
civic-report/
├── server/   Express + TS API. Validation & store are pure modules (unit-testable
│             without HTTP); createApp() takes the store as a parameter so
│             integration tests get a fresh isolated app per test.
├── web/      Vite + React + TS. Dev server proxies /api to :3001 so the frontend
│             never hardcodes an API origin.
├── e2e/      Playwright + Axe Core. playwright.config.ts boots both dev servers
│             itself (webServer), so `npm run test:e2e` works from a cold clone and
│             in CI with zero orchestration scripts.
└── Dockerfile  Multi-stage: build both workspaces, ship only server/dist + web/dist
                in a slim runtime image; Express serves the static frontend.
```

## Key decisions

**Validation lives on the server, UI renders server errors.** Single source of truth — the form posts and renders the `errors[]` the API returns. No duplicated client-side rules to drift out of sync. (Trade-off: a round-trip to see errors; acceptable at this scale, and it guarantees the API is safe regardless of client.)

**Errors are structured (`{field, message}`)**, which is what makes the accessible error-summary pattern possible: the UI links each message to its input and manages focus.

**In-memory store behind a class.** `ReportStore` is the only stateful thing; swapping to Postgres means reimplementing four methods. Marked with `ponytail:` in code.

**Test seams over mocks.** Integration tests use Supertest against a real `createApp()`; component tests stub only `fetch`; e2e tests stub nothing.

## What I'd add next for production

1. Postgres + migrations (replace `ReportStore`)
2. AuthN/AuthZ for the status-update endpoint (currently open — fine for demo, not for prod)
3. Rate limiting + helmet
4. Structured logging (pino) + request IDs for troubleshooting
5. Pagination on GET /reports
