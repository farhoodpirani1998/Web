# Admin Panel — Frontend

CMS Admin Panel frontend for Nedaye Haghighat Educational Group. A
separate application from `../frontend` (the public website), sharing
the same backend (`../backend`, NestJS) as its eventual API.

## Status

The admin includes persistent authentication, permission-gated routes
and controls, and CMS management screens for site content and
administration. Login uses an httpOnly refresh-token cookie to restore
sessions; the access token stays in memory only. See
`src/features/auth/AuthProvider.tsx`, `src/features/auth/authStore.ts`,
and `../backend/src/modules/website/identity/auth/` for the session
flow and token rotation details.

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
