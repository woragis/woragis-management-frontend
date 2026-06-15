# Woragis Management Frontend

React admin UI for the Woragis management API.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173 — Vite proxies `/v1` to the backend at `http://127.0.0.1:8080`.

## Login

Use the same `ADMIN_API_KEY` configured in the backend `.env`. Leave API URL empty in dev to use the Vite proxy.

## Pages

- **Projects** — list, create, edit (links, domains, secrets, gallery)
- **Media** — upload files (stored in Railway bucket via backend)
- **Profile** — landing hero / about data

## Production

Set `VITE_API_URL` to your deployed API origin if not using a reverse proxy.
