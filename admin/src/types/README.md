# types/

Shared TypeScript types/interfaces used across the app.

- `auth.ts` — Sprint 2.4A: `AdminUser`, `LoginCredentials`,
  `LoginResponse`, `CurrentAdminResponse`, etc. Mirrored from the CMS
  backend's own types (see file header) — the admin frontend has no
  code path capable of reaching or importing SMS-side types. Sprint
  2.5: re-verified `AdminRole`/`AdminPermission` against
  `WebsiteRole`/`WebsitePermission` (backend) — still in lockstep, no
  changes needed here. See `lib/permissions.ts` and
  `hooks/usePermissions.ts` for the checks built on top of these types.
