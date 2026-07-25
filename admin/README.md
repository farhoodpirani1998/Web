# Admin Panel — Frontend

CMS Admin Panel frontend for Nedaye Haghighat Educational Group. A
separate application from `../frontend` (the public website), sharing
the same backend (`../backend`, NestJS) as its eventual API.

## Status

**Sprint — Persistent Login.** The full CMS Admin authentication flow
now works end-to-end, including persisted sessions: `/login` has a
real form, `/admin/*` redirects unauthenticated users to `/login` (and
back again after they sign in), the header has a working logout
button, and a page reload no longer requires signing in again — an
httpOnly refresh-token cookie (set by the backend on login) lets
`AuthProvider` silently obtain a fresh access token on mount. See
`features/auth/AuthProvider.tsx` and `features/auth/api.ts` for the
flow, and `../backend/src/modules/website/identity/auth/` (in
particular `cms-refresh-token.service.ts`) for the backend half:
token rotation on every refresh, reuse detection with a short grace
window for benign races (e.g. two tabs), and revocation on logout.

The access token itself is still deliberately in-memory only (not
persisted directly) — see `features/auth/authStore.ts` for why. The
following are still intentionally **not** implemented:

- Permissions-aware UI (role/permission data is fetched and stored, but
  nothing branches on it yet)
- Any CMS content features

## Stack

- React 18
- Vite 5
- TypeScript 5 (strict)
- Tailwind CSS 3

## Getting started

```bash
npm install
npm run dev       # start dev server (http://localhost:5174)
npm run build     # type-check + production build
npm run typecheck # type-check only
npm run lint      # eslint
npm run format    # prettier --write
```

## Project structure

```
src/
 ├── app/        # Root App component (composition root)
 ├── pages/      # Route-level page components
 ├── features/   # Feature-sliced CMS modules (auth/ so far — 2.4A)
 ├── routes/     # Router configuration
 ├── components/ # Shared/reusable UI components
 ├── lib/        # Shared utilities (env config, API client, API errors)
 ├── hooks/      # Shared React hooks                   (empty so far)
 ├── types/      # Shared TypeScript types (auth.ts — 2.4A)
 └── assets/     # Static assets, global styles
```

Path aliases (`@/...`) mirror this structure — see `tsconfig.app.json`.

## Environment variables

Copy `.env.example` to `.env` (or `.env.development` for local dev,
already committed with safe defaults) before running. See
`.env.example` for the current variable list and notes on what's
deferred to later sprints.
