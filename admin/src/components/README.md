# components/

Shared/reusable UI components used across pages and features.

- `layout/` — structural shell components (sidebar, header, admin
  layout). Applied once per route tree, not per page.
- `ui/` — Sprint 1.6: reusable page-building-block primitives
  (`PageContainer`, `PageHeader`, `Section`, `EmptyState`,
  `Breadcrumb`). Presentational only — no data fetching, no business
  logic. Admin pages compose these instead of redefining their own
  wrapper markup.
  - `PermissionGate.tsx` — Sprint 2.5: conditionally renders children
    based on the current admin's permissions/role (via
    `usePermissions`). UI convenience only, not an authorization
    boundary — the backend's own guards are what actually enforce
    access.
