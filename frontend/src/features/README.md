# Features

One self-contained folder per real site section (Hero, Stats, About,
Campuses, Features, Achievements, News, Gallery, CTA Banners,
Navigation, Footer, Portal Links, Site Settings–derived chrome) —
matching the backend content-module list one-to-one (Website Frontend
Architecture §4, §10, §31).

Each feature colocates its own components, data-fetching hook(s), and
types. Features depend on the shared layers (design system, API layer,
i18n, utilities) but never on another feature's internals (§30, §32).

**This folder is intentionally empty in Phase 1.** Bootstrap Foundation
scaffolds the app-shell, routing, providers, design-system primitives,
and API layer only — no site section, CMS integration, or business
logic is implemented yet (see the Phase 1 spec's exclusions). The first
feature folder is added in the phase that implements that section.
