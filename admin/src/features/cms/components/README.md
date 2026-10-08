# features/cms/components/

Shared UI used by more than one CMS content module — the CMS-specific
middle tier between a single module's own components
(`features/cms/<module>/`) and the app-wide primitives in
`components/ui/`.

Empty as of Sprint 3.4: no second content module exists yet to prove
what's actually shared (Media, built this sprint, is the first). Real
candidates once News/Pages/FAQ/etc. exist, per the Sprint 3.3 audit's
recommended build order:

- A `PublishStatusBadge`-type component for `CmsPublishStatus`
  (`draft`/`published`/`archived`) — every module with a publish
  workflow needs the same badge.
- A reorder list/drag-handle piece — eight modules are reorderable
  (Gallery, Hero, FAQ, Portal Links, Menu Items, Campuses, Teachers,
  Statistics, Features per the audit's module table) and should share
  one drag-and-drop implementation, not eight.
- A revisions history/restore panel — needed by News, Pages, Hero,
  Events, Campuses, Teachers, About (see the audit's table's
  "Revisions" column).

## Where a component belongs

- Used by exactly one module → that module's own folder
  (`features/cms/<module>/`), per `features/cms/README.md`. Don't
  pre-promote something only Media (or only News) needs.
- Used by two or more CMS modules, but nowhere outside the CMS admin
  (e.g. a publish-status badge) → here.
- Used outside the CMS admin too (e.g. `EmptyState`, `PageContainer`) →
  `components/ui/`, not here.

Don't create a component here speculatively ahead of a second module
actually needing it — same reasoning `components/README.md` already
gives for `components/ui/`.
