# CivicReport API

Base URL: `http://localhost:3001/api`

All error responses share one shape:

```json
{ "errors": [{ "field": "title", "message": "Enter a short title for the issue" }] }
```

## GET /health

Liveness probe. → `200 { "status": "ok" }`

## GET /categories

→ `200 ["roads", "lighting", "waste", "water", "other"]`

## GET /reports

Query params (optional): `category`, `status` (`open | in_progress | resolved`).
Unknown values → `400`. Returns newest first.

```json
[
  {
    "id": 1,
    "title": "Pothole on main road",
    "category": "roads",
    "location": "Jalan Malioboro 5",
    "description": "Deep pothole near the crossing",
    "status": "open",
    "createdAt": "2026-07-26T12:00:00.000Z"
  }
]
```

## POST /reports

Body: `title` (≤100 chars), `category`, `location`, `description` (≤1000 chars). All required, strings trimmed.

- `201` → created report (status always starts `open`)
- `400` → field errors, one entry per invalid field

## GET /reports/:id

- `200` → report
- `404` → `{ "errors": [{ "field": "id", "message": "Report not found" }] }`

## PATCH /reports/:id/status

Body: `{ "status": "open" | "in_progress" | "resolved" }`

- `200` → updated report
- `400` → invalid status value
- `404` → unknown id

## Cross-cutting behavior

- **Rate limiting**: 100 requests/min per IP on `/api/*` → `429` with the standard error shape.
- **Body limit**: JSON bodies over 50 kB → `413`. Malformed JSON → `400 { "errors": [{ "field": "request", "message": "Invalid request body" }] }`.
- **Unknown `/api/*` route** → `404` JSON (never the SPA fallback).
- **Security headers** on every response: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Content-Security-Policy` (self-only).
- **5xx** responses are generic JSON; stack traces are logged server-side only.
