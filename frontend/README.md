# Nedaye Haghighat — Public Website

The public-facing website for the Nedaye Haghighat Educational Group. It is an implemented Persian-first, right-to-left React application with a homepage and dedicated informational, directory, content, and registration pages—not a scaffold or placeholder landing page.

## Current pages

| Route | Page |
| --- | --- |
| `/` | Homepage with hero, statistics, about, campuses, features, achievements, news, gallery, testimonials, and call to action |
| `/about` | About the group |
| `/schools` · `/schools/:slug` | Schools and school details (using the campus resource) |
| `/campuses` · `/campuses/:slug` | Campus directory and details |
| `/teachers` · `/teachers/:slug` | Teacher directory and profiles |
| `/news` · `/news/:slug` | News listing and article details |
| `/events` · `/events/:slug` | Events listing and event details |
| `/gallery` | Gallery |
| `/statistics` | Statistics |
| `/library` · `/library/:slug` | Textbook search, details, and downloads |
| `/admissions` | Admissions information |
| `/pre-registration` | Pre-registration information and form |
| `/academic-calendar` | Academic calendar |
| `/contact` | Contact information and form |
| `/site` | Site information |
| `/pages/:slug` | Slug-addressed static content page |

Unknown routes render a not-found page. Route components are lazy-loaded, and the shared application shell provides site navigation, page loading UI, and error boundaries.

## Implemented functionality

- Homepage sections and dedicated pages for the public site’s main content areas.
- Public API client and TanStack Query hooks used by selected features and detail pages. The pre-registration form submits to the public pre-registration endpoint; the textbook library supports searching and detail/download flows.
- Some sections and listing pages still display frontend-authored content. The presence of a page or feature module does not imply that all of its content is CMS/API-backed.
- Persian-first UI and RTL document direction, responsive layouts, shared design-system components, and page-level SEO support.
- Page SEO metadata is applied by the shared SEO layer after client-side route data loads. In production, `/robots.txt` and `/sitemap.xml` are proxied to the backend so their sitemap URLs use the configured public-site origin rather than a development hostname.

## Stack

- React 18, TypeScript 5, and Vite 5
- React Router 6 for routing
- TanStack Query 5 and Axios for server-state and HTTP requests
- Tailwind CSS 3; Radix UI Slot, CVA, `clsx`, and `tailwind-merge` for UI composition
- Lucide React icons
- ESLint and Prettier; Vitest, Testing Library, and jsdom for tests

## Requirements and setup

Node.js 18.18 or newer and npm.

From this directory:

```bash
npm install
```

Optionally copy `.env.example` to `.env` to override the local settings, then start the development server:

```bash
npm run dev
```

Vite serves the app at `http://localhost:5173` by default. The public API base URL defaults to `http://localhost:3100/public`; configure it if the API runs elsewhere. The `test:a11y` browser suite stubs public API requests and does not require a running backend.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create the production build |
| `npm run preview` | Preview the production build |
| `npm run test` | Run the Vitest suite |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:seo` | Check homepage internal links against the registered public routes (Playwright) |
| `npm run test:a11y` | Run API-independent Playwright checks for skip-link keyboard focus, mobile navigation, RTL, and overflow (requires the Chromium browser) |

For local Playwright runs, install Chromium with `npx playwright install chromium`. If browser downloads are unavailable but Chrome is already installed, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable path before running `test:a11y`. CI installs and uses Playwright Chromium.
| `npm run lint` | Run ESLint with warnings treated as errors |
| `npm run lint:fix` | Run ESLint with automatic fixes |
| `npm run format` | Format files with Prettier |
| `npm run format:check` | Check formatting without writing files |
| `npm run typecheck` | Run TypeScript checks without emitting output |
| `npm run measure:bundle` | Report local production JS/CSS raw and gzip-estimated sizes after `npm run build` |

## Environment variables

Environment values are read through `src/shared/config/env.ts`. Defaults are provided for local development.

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_PUBLIC_API_BASE_URL` | Base URL for the Website Public API | `http://localhost:3100/public` |
| `VITE_DEFAULT_LOCALE` | Default site locale | `fa` |
| `VITE_API_TIMEOUT_MS` | Public API request timeout in milliseconds | `15000` |
| `VITE_APP_ENV` | Non-sensitive environment label | `development` |
| `VITE_MAP_STYLE_URL` | Optional MapLibre-compatible style URL for the contact-page school map | — |

The contact-page map falls back to a directory with directions links if this URL is unset or the style cannot be loaded. For a hosted style, obtain a key from a provider such as MapTiler, set `VITE_MAP_STYLE_URL` in the frontend environment, and restrict the provider key to the deployed site origin.

## Source layout

```text
src/
├── app/          # App providers, layout, shell, and route configuration
├── pages/        # Route-level page compositions
├── features/     # Public site sections and feature-specific API/query code
├── shared/       # API utilities, configuration, errors, SEO, and UI components
├── i18n/         # Locale and direction helpers
└── assets/       # Global styles and fonts
```
