# CMS Admin Panel

The authenticated content-management application for Nedaye Haghighat. It is a separate React SPA from `../frontend` and uses the NestJS API in `../backend`.

## Current functionality

The admin provides local CMS authentication with persistent refresh sessions, role- and permission-protected routes, CMS content editing, media management, incoming form submissions, administrator management, and an audit log. The access token is held in memory; the refresh token is delivered in an httpOnly cookie.

The route tree is defined in `src/routes/index.tsx`. It includes:

- Overview and content: dashboard, pages, news, events, gallery, hero slides, FAQs, and textbooks.
- Site sections: about, achievements, academic calendar, admissions, CTA, features, statistics, testimonials, and trust badges.
- People and navigation: campuses and campus map, teachers, menus, and portal links.
- Submissions and administration: pre-registrations, contact messages, newsletter subscribers, audit log, admin users, and settings.
- Login and not-found routes.

Access to admin routes is checked by the route guard and permission map; the sidebar filters links using the same access rules.

## Stack and requirements

- Node.js `>=22.12.0` (from `package.json`; CI and Docker use Node 22)
- React 18, TypeScript, Vite 8, React Router 7, TanStack Query 5, and TanStack Table 9
- React Hook Form and Zod for forms; Tailwind CSS and Lucide React for UI
- Vitest and Testing Library for tests

## Getting started

Configure `VITE_ADMIN_API_BASE_URL` in `.env` if the API is not at its local default. The backend must allow the admin origin in `CORS_ALLOWED_ORIGINS` when the browser and API use different origins.

```bash
npm ci
npm run dev
```

Vite serves the app at `http://localhost:5174` by default.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create the production build |
| `npm run typecheck` | Type-check without emitting build output |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest suite |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run format` | Format files with Prettier |
| `npm run format:check` | Check formatting without writing files |

## Environment

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_ADMIN_API_BASE_URL` | Base URL for the CMS admin API | `http://localhost:3100/admin` |
| `VITE_APP_ENV` | Non-sensitive environment label | `development` |

Only variables prefixed with `VITE_` are exposed to the browser. Do not put credentials or secrets in this file.

## Source layout

`src/app/` composes providers and the root component; `src/routes/` defines routes, navigation, and access rules; `src/features/` contains auth and CMS features; `src/pages/` contains route-level page compositions; and `src/components/`, `src/hooks/`, and `src/lib/` provide shared UI, hooks, and API utilities.
