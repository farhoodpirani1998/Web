# hooks/

Shared React hooks used across the app.

- `usePermissions.ts` — Sprint 2.5: reads the current admin from
  `useAuth()` and exposes `can`/`canAny`/`canAll`/`hasRole`/`hasAnyRole`
  checks against it. Makes no API calls — see the file header.
- `useUnsavedChangesGuard.ts` — Sprint "Unsaved Changes Protection":
  exports `useIsDirty` (snapshot-vs-current dirty detection) and
  `useUnsavedChangesGuard` (the `beforeunload` + in-app route-blocker
  + guarded-Cancel-button behavior built on top of it). Paired with
  `components/ui/UnsavedChangesDialog.tsx`. See that file's header for
  the full pattern and which CMS forms use it.
