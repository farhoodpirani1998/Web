# types/

Shared TypeScript types/interfaces used across the app.

- `auth.ts` — Sprint 2.4A: `AdminUser`, `LoginCredentials`,
  `LoginResponse`, `CurrentAdminResponse`, etc. Mirrored from the CMS
  backend's local auth types (see file header). `AdminRole` and
  `AdminPermission` match the backend's `WebsiteRole` and
  `WebsitePermission`. See `lib/permissions.ts` and
  `hooks/usePermissions.ts` for the checks built on top of these types.
