# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Nedaye Haghighat — CMS Admin Panel (`admin/`). Persian RTL educational-group admin (Vazirmatn + Estedad). Dark navy (`#0F2D52`) / gold (`#C9A227`) brand. Single site (no multi-site model in admin).

## Common commands

```bash
# Dev server (admin folder)
cd admin && npm run dev

# Build (TypeScript check + Vite build)
npm run build

# Run a single test file (vitest)
npm run test -- --run src/features/cms/teachers/TeacherForm.test.tsx

# Type-check (no emit)
npx tsc -b --noEmit

# Lint + format
npm run lint && npm run format

# All tests
npm run test
```

## High-level architecture (read these together)

- `admin/src/app/App.tsx` — root with `AuthProvider` + `RouterProvider`; wrap in `ErrorBoundary` if adding (security gap noted).
- `admin/src/routes/index.tsx` — lazy-loaded `AdminLayout` + `RequireAuth` + `RequireRouteAccess` (pathless layout route guards all `/admin/*`). Routes registered by sprint (see comments).
- `admin/src/components/layout/AdminLayout.tsx` — responsive shell: persistent sidebar (`AdminSidebar` with `collapsed` + `localStorage`), mobile drawer (`mobileOpen` + body scroll lock), `GlobalSearchProvider`. Focus-trap and skip-link need care on mobile drawer.
- `admin/src/components/layout/AdminSidebar.tsx` — dark sidebar; groups from `routes/nav.config.ts`; filters by `canAccessRoute` (`routes/route-permissions.ts`). Only `media` and `admin-users` are gated beyond `content:read`.
- `admin/src/features/auth/authStore.ts` + `features/auth/` — JWT refresh-on-401 via `apiClient` interceptor; `withCredentials: true` for httpOnly refresh cookie.
- `admin/src/lib/apiClient.ts` — single axios instance (`env.adminApiBaseUrl`); Bearer header from `getAccessToken()`; retry-after-refresh logic (dedupe `refreshPromise`); clears auth on final 401.
- CMS modules (`features/cms/<module>/`) follow a convention: `types.ts` (mirrors backend DTO), `api.ts` (only this file knows URLs; base already `/admin`), `hooks/useX.ts` (TanStack Query v5 with `queryKeys`, optimistic updates for status/reorder/schedule), `index.ts` (public surface), `Form.tsx` (RHF + `zodResolver`), `List.tsx` (TanStack Table v9), `Page.tsx` (page orchestrator).
- Design tokens: `admin/src/assets/styles/globals.css` (HSL triplets, `--brand-navy`, `--brand-gold`, dark sidebar palette `--sidebar-*`, typography Vazirmatn/Estedad). Mirrored from `frontend/src/shared/design-system/tokens/tokens.css` — keep in sync.
- Components use `lucide-react`, `tailwind-merge` (`cn`), `class-variance-authority` (`Button`, etc.). No shared dialog primitive yet — forms use fixed overlay (see `HeroSlideForm` / `NewsForm` pattern).

## Critical conventions

- Module APIs never import from sibling CMS modules; `index.ts` is the only public surface.
- `Translatable<string>` (fa/en nested) is standard for prose fields; `slug` is lowercase kebab-case (`/^[a-z0-9]+(?:-[a-z0-9]+)*$/`).
- `seo` nested object is optional; `noindex` always required boolean (`default: false`).
- Media references (`avatarMediaId`, `featuredImageMediaId`) are UUIDs tracked via `MediaUsage`; clearable with explicit `null` on PATCH.
- Reordering (`position` + `/reorder`) requires sending FULL ordered id array; never a filtered subset.
- Persistent login relies on backend `httpOnly` refresh cookie; admin SPA and API may be different origins (CORS configured in backend `main`).
- Every new module should include: `schema.ts` (Zod + converters), `hooks/useX.ts` (TanStack Query), `Form.tsx` (RHF), `List.tsx` (TanStack Table), `index.ts` exports.

## Attribution (required for all commits / PRs)

End commit messages with:
```
Co-Authored-By: Claude Code <noreply@anthropic.com>
```
End PR descriptions with:
```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```
