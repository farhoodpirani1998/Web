# Website Frontend — Phase 1 (Bootstrap Foundation)

Public website frontend for the Nedaye Haghighat Educational Group.
This package contains **only** the Phase 1 bootstrap scaffold: tooling,
providers, routing, the design-system foundation, and the API layer
skeleton. No site sections, CMS integration, or business logic are
implemented yet — see [Scope](#scope) below.

## Tech stack

- **React 18** + **Vite 5** + **TypeScript 5** (strict mode)
- **Tailwind CSS** with a token-driven theme (navy-and-gold brand identity)
- **shadcn/ui** conventions (`components.json`, `cn()` utility, CVA-based primitives)
- **React Router 6** (flat route tree; i18n-ready, not locale-prefixed)
- **TanStack Query 5** (server-state/cache layer)
- **Axios** (single HTTP client for the Website Public API)
- **ESLint** + **Prettier** (with `prettier-plugin-tailwindcss`)

## Requirements

- Node.js **18.18+** (or 20+)
- npm 10+ (or your preferred package manager — the lockfile is npm's)

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables and adjust as needed
cp .env.example .env

# 3. Start the development server
npm run dev
```

The dev server runs at `http://localhost:5173` by default. Visiting `/`
renders the Phase 1 placeholder page confirming the app shell, router,
and providers are wired correctly. The site is Persian-only in Phase 1
(`<html lang="fa" dir="rtl">`).

## Scripts

| Script                 | Purpose                                              |
| ---------------------- | ----------------------------------------------------- |
| `npm run dev`          | Start the Vite dev server                              |
| `npm run build`        | Type-check (`tsc -b`) and build for production          |
| `npm run preview`      | Preview the production build locally                    |
| `npm run lint`         | Run ESLint (zero warnings allowed)                       |
| `npm run lint:fix`     | Run ESLint with automatic fixes                          |
| `npm run format`       | Format the codebase with Prettier                        |
| `npm run format:check` | Check formatting without writing changes                 |
| `npm run typecheck`    | Type-check only, no emit                                  |

## Environment variables

Defined in `.env.example` (copy to `.env` for local overrides) and read
exclusively through `src/shared/config/env.ts`:

| Variable                     | Purpose                                              |
| ----------------------------- | ----------------------------------------------------- |
| `VITE_PUBLIC_API_BASE_URL`   | Base URL of the **Website Public API** (never the admin API) |
| `VITE_DEFAULT_LOCALE`        | The site's active locale (drives `<html lang/dir>`)    |
| `VITE_API_TIMEOUT_MS`        | Axios client request timeout, in milliseconds          |
| `VITE_APP_ENV`               | Non-sensitive environment label for diagnostics        |

## Folder structure

```
src/
├── app/                    # App shell: root composition only
│   ├── App.tsx             #   composes providers + router
│   ├── providers/          #   AppProviders (query client, error boundary)
│   ├── layout/             #   persistent layout shell, page loader
│   └── routes/             #   router (flat, Persian-only in Phase 1)
├── pages/                  # Route-level composition units (thin)
├── features/                # One folder per site section — empty in Phase 1
├── shared/
│   ├── design-system/       # Tokens + content-agnostic primitives (Button, Spinner)
│   ├── api/                 # Axios client, query client, error normalization
│   ├── config/               # env config, app metadata, cache defaults, feature flags
│   ├── hooks/                # Cross-cutting, content-agnostic hooks
│   ├── utils/                # cn() and other framework-agnostic helpers
│   └── error/                 # ErrorBoundary
├── i18n/                    # Locale list, RTL/direction mechanics (owns locale data)
└── assets/
    ├── styles/               # globals.css, fonts.css
    └── fonts/                # Self-hosted brand font files (add when finalized)
```

This mirrors the **feature-first**, strictly-layered architecture
defined in `Website-Frontend-Architecture.md` (§3–§6, §33): a lower
layer never depends on a higher one, and a new site section is always a
new `features/<name>` folder — never a restructuring of this scaffold.

## Scope

**In scope (Phase 1 — Bootstrap Foundation):**

- Project tooling: Vite, TypeScript, Tailwind, shadcn/ui conventions,
  ESLint, Prettier, path aliases, environment variables
- App shell: providers, persistent layout, error boundary, loading UI,
  not-found page
- Flat, Persian-only route structure (structure only — no content
  routes); locale *mechanism* (`src/i18n`) is ready for a second
  locale without a routing rewrite
- API layer skeleton: Axios client, TanStack Query client, normalized
  error types (no per-endpoint query functions yet)
- Design-system foundation: tokens, `Button`, `Spinner`

**Out of scope (deferred to later phases):**

- Any site section (Hero, Stats, About, Campuses, Features,
  Achievements, News, Gallery, CTA, Navigation, Footer, Portal Links)
- Homepage composition
- CMS/Public-API integration beyond the base client
- Business logic, mock content, or per-endpoint data fetching
- UI-chrome translation dictionary (locale *mechanics* exist; the
  dictionary is added with the first feature that needs it)

See `Website-Frontend-Architecture.md` for the full, authoritative
architecture this scaffold implements.
