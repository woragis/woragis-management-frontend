# Woragis Management Frontend

React admin UI for the Woragis management API.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173 — Vite proxies `/v1` to the backend at `http://127.0.0.1:8080`.

## Authentication

### Local dev

Set `VITE_ADMIN_API_KEY` in `.env` (same value as `ADMIN_API_KEY` on the backend), or enter it once on the login screen. Leave `VITE_API_URL` empty to use the Vite proxy.

### Vercel / production

Configure in the Vercel project:

| Variable | Example |
|----------|---------|
| `VITE_API_URL` | `https://api.woragis.example` |
| `VITE_ADMIN_API_KEY` | same as backend `ADMIN_API_KEY` |

The app connects automatically on load — no manual API URL or key form.

> **Note:** `VITE_*` variables are embedded in the client bundle at build time. Use this only for a private admin panel; do not treat the key as a secret from end users who can open DevTools.

## Pages

- **Dashboard** — overview
- **Projects** — list, create, edit (links, domains, secrets, gallery)
- **Media** — upload files (stored via backend)
- **Profile** — landing hero / about data
- **Finance** — income, expenses, invoices
- **Content** — LeetCode video pipeline
