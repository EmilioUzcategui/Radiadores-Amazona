# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Monorepo with two independent npm packages (no workspace/root package.json):

- `backend/` — Express 5 + TypeScript REST API run via `tsx` (no build step). PostgreSQL data store.
- `frontend/` — Next.js 16 (App Router, React 19) dashboard + landing page.

Each package has its own `package.json`, `.env`, and `node_modules`. Run all commands from inside the respective directory.

## Commands

### Backend (`cd backend`)
- `npm run dev` — start API with hot reload (nodemon + tsx) on `PORT` (default 3001)
- `npm start` — run once with tsx
- `docker compose up -d` — start local Postgres 15 (exposed on host port **5433**, container 5432)
- No tests and no lint configured (`npm test` intentionally exits 1).

### Frontend (`cd frontend`)
- `npm run dev` — Next dev server on port 3000
- `npm run build` / `npm start` — production build / serve
- `npm run lint` — ESLint (flat config, `eslint-config-next`)

## Architecture

### Backend request flow
The API follows a strict per-feature module layout under `backend/src/modules/<feature>/`, each with the same file set:
- `*.route.ts` — Express `Router`, mounted in `backend/index.ts` under `/api/<feature>`
- `*.controller.ts` — HTTP handlers; parse/validate input, shape the JSON response
- `*.model.ts` — all SQL; calls the shared `query()` helper
- `*.schema.ts` — Zod schemas (input validation) and TypeScript response types

Current modules: `auth/users`, `metrics`, `inventory`. When adding a feature, replicate this five-file structure and register the router in `index.ts`.

Cross-cutting pieces:
- `src/config/database/db.ts` — single `pg.Pool` plus the exported `query(text, params)` helper. **Always go through `query()`** with parameterized SQL; SSL is forced on (`rejectUnauthorized: false`) for Supabase/remote Postgres.
- `src/api/middlewares/auth.token.ts` — `authToken(user)` mints a 2h JWT; `verifyAuthToken` is the route guard that reads `Bearer` token and sets `req.user`. Note most routes are currently **unguarded** — only `/api/users/me` (GET/PUT) uses `verifyAuthToken`.
- `src/services/email.service.ts` — Resend integration for password-recovery codes.
- `src/jobs/metrics.job.ts` — `node-cron` job started from `index.ts` on boot (currently a no-op stub that would call an external n8n prediction webhook).

API response convention: every handler returns `{ success: boolean, message: string, ... }`, with payloads under `data`. Validation errors return 400 with Zod `issues`; user objects are passed through `sanitizeUser` to strip `password` before responding. Code, comments, and user-facing messages are in **Spanish** — match that.

### Frontend
- App Router under `src/app/`. Public landing (`/`, `/about`, `/contact`, `/products`), auth flow (`/auth`, `/auth/recovery-password/...`), and protected `/dashboard/*` (inventory, clients, metrics) sharing `dashboard/layout.tsx`.
- `lib/api.ts` — central Axios instance (`baseURL` from `NEXT_PUBLIC_API_URL`, default `http://localhost:3001`). A request interceptor injects the JWT, reading it from either `setAuthToken()` or the persisted Zustand store in `localStorage` (key `auth-storage`).
- `services/` — typed API wrappers (e.g. `inventory.service.ts`, `auth/users.service.ts`); these own the request/response TypeScript types and error-message extraction. Components call services, not Axios directly.
- `src/store/authStore.ts` — Zustand store with `persist` middleware; holds `token`/`user`/`isAuthenticated`. This is the source of truth for auth across reloads.
- UI uses Tailwind CSS v4 (via `@tailwindcss/postcss`), Chart.js (`react-chartjs-2`) for dashboard charts, and SweetAlert2 for dialogs.

### Frontend Next.js caveat (important)
`frontend/AGENTS.md` (referenced by `frontend/CLAUDE.md`) warns this Next.js build has breaking changes from public Next.js — APIs, conventions, and file structure may differ from training data. **Read the relevant guide in `frontend/node_modules/next/dist/docs/` before writing Next.js code**, and heed deprecation notices.

## Environment

Backend `.env` (see `backend/.env.example`): `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `DB_USER`/`DB_PASSWORD`/`DB_HOST`/`DB_PORT`/`DB_NAME` (or a full `DATABASE_URL`), `RESEND_API_KEY`, `FRONTEND_URL` (CORS origin, default `http://localhost:3000`).

Frontend `.env`: `NEXT_PUBLIC_API_URL` pointing at the backend.
