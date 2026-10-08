# features/

Feature-sliced CMS modules (e.g. one folder per admin feature: news,
events, teachers, etc.), following the same convention as the public
frontend's `src/features/`.

- `auth/` — Sprint 2.4A: token store + `/admin/auth/login` /
  `/admin/auth/me` request functions. Sprint 2.4B adds `AuthProvider`/
  `useAuth` (bootstrap check + reactive auth status) and the
  `RequireAuth`/`RedirectIfAuthenticated` route guards used in
  `routes/index.tsx`. The full login/logout flow now works — see the
  root `README.md`'s Status section.
- `cms/` — Sprint 2.6 laid down architecture-only conventions (shared
  cross-module types in `types.ts`). Sprint 3.4 adds the first real
  module, `cms/media/` (media library API + a shared id→media cache/
  hooks + a `MediaPicker` foundation — built first since every future
  content module references it via `mediaId`), plus `cms/components/`
  for UI shared across CMS modules. See `cms/README.md` for the full
  picture and where a *new* module's API/hooks/components should go.

News/Pages/Gallery/FAQ and the rest of the content modules are still
out of scope — see `cms/README.md`'s scope notes and the Sprint 3.3
audit's recommended build order.
