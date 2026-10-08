# Website Management System — Phase 0 (Kernel) Technical Design v2
### Nedaye Haghighat Educational Group — Website Module

**This is an addendum to Phase 0 Technical Design v1**, not a redesign. Only §3 (Folder Structure), §7 (Media Architecture), and §16 (Module Dependencies) are affected, by the two requested refinements below. Sections 1, 2, 4, 5, 6, 8–15, 17–20 from v1 stand exactly as written and are not reproduced here.

---

## Refinement 1: No `WebsiteCoreModule` Barrel

**Problem with v1:** `WebsiteCoreModule` re-exported every kernel sub-module (`common`, `site`, `media`, `seo`, `publishing`, `ordering`, `events`, `revisions`) as one bundle, so any future module — even one that only needed `OrderingService` — would import all eight. That's exactly the kind of incidental coupling that makes a kernel harder to reason about over time: every kernel change becomes a change to "the one thing everything imports."

**Dependency philosophy (replaces the v1 barrel approach):**

- **Every kernel piece is its own independent NestJS module**, with its own explicit `imports`/`exports`. `MediaModule` exports `MediaService`; `OrderingModule` exports `OrderingService`; and so on — no sub-module reaches into another's internals except through its declared exports.
- **`WebsiteModule` (the top-level module from v1 §3) is a composition root, not a re-export barrel.** It imports every kernel module so they're all registered and wired into the Nest dependency-injection graph exactly once, but it does not bundle-export them as a single unit for others to consume.
- **Future content modules (Phase 2+) import only the specific kernel modules they actually use.** `CampusesModule` imports `MediaModule` + `SeoModule` + `PublishingModule` + `OrderingModule` because Campus genuinely uses all four — but it does **not** import `RevisionsModule`, because Campus was scoped out of revisions in v3 §18. A module that has no ordering concern simply never imports `OrderingModule`. This makes each content module's actual dependencies visible and auditable from its own `imports` array, rather than implicit through one shared barrel.
- **Why this matters at this scale:** the kernel is deliberately small (eight pieces), so the barrel felt harmless — but the cost shows up later, not now: once 13+ content modules exist, "what does `NewsModule` actually depend on?" should be answerable by reading `NewsModule`'s own imports, not by knowing that `WebsiteCoreModule` quietly includes everything. This is a maintainability choice, not a scalability one — it doesn't change what Phase 0 builds, only how modules declare what they use.
- **Cross-kernel dependencies stay as designed in v1** (e.g. `MediaModule` still depends on `SiteModule` and `EventsModule` internally) — those are real, necessary dependencies between kernel pieces themselves, not something this refinement removes. What changes is only that *consumers outside the kernel* no longer get all of it for free through one import.

### Updated Folder Structure (§3 delta)

```
src/modules/website/
├── website.module.ts        (composition root — imports every kernel + future content module;
│                              does NOT re-export them as a bundle)
│
└── core/
    ├── common/               (own module: common.module.ts — exports base classes/decorators as providers/utilities)
    ├── site/                 (own module: site.module.ts — exports SiteService)
    ├── media/                (own module: media.module.ts — exports MediaService, MediaFolderService;
    │                          internally imports SiteModule, EventsModule)
    ├── seo/                  (own module: seo.module.ts — exports SeoService, SitemapService)
    ├── publishing/           (own module: publishing.module.ts — exports PublishingService;
    │                          internally imports EventsModule)
    ├── ordering/             (own module: ordering.module.ts — exports OrderingService)
    ├── i18n/                 (own module: i18n.module.ts — exports locale enum/pattern utilities)
    ├── events/               (own module: events.module.ts — registers @nestjs/event-emitter, exports nothing
    │                          beyond the constants/payload types, which are plain imports, not DI-provided)
    ├── revisions/            (own module: revisions.module.ts — exports RevisionsService;
    │                          internally imports CommonModule, EventsModule)
    └── permissions/          (not a runtime module — website-permissions.seed.ts remains a migration-time script,
                               unchanged from v1)
```

`website-core.module.ts` is **removed** from the folder structure. Each `core/*` sub-folder is a complete, independently importable Nest module.

### Updated Module Dependency Graph (§16 delta)

```
                 ┌────────────────────┐
                 │  AuthModule / RBAC   │ (existing, external)
                 └──────────┬───────────┘
                             │ guards, permission tables
                             ▼
                 ┌────────────────────┐
                 │    WebsiteModule     │  (composition root — imports every module below,
                 │                       │   re-exports NOTHING as a bundle)
                 └──────────┬───────────┘
                             │ imports (registers each once)
        ┌─────────┬─────────┼─────────┬──────────┬───────────┬────────────┐
        ▼         ▼         ▼         ▼          ▼           ▼            ▼
    Common      Events     Site      Seo    Publishing   Ordering     Revisions
    Module      Module    Module    Module    Module      Module       Module
        ▲         ▲          │                                            ▲
        │         │          │                                            │
        │         └──────────┼────────────────────────────────────────────┘
        │                    │ (Revisions & Publishing depend on EventsModule directly)
        │                    ▼
        │              MediaModule ── depends on ──► SiteModule, EventsModule
        │                    ▲
        └────────────────────┘ (Media depends on CommonModule for base classes)


   Phase 2+ content modules (future) import ONLY what they need, e.g.:

   CampusesModule ──imports──► MediaModule, SeoModule, PublishingModule, OrderingModule
   NewsModule      ──imports──► MediaModule, SeoModule, PublishingModule, OrderingModule, RevisionsModule
   HeroModule      ──imports──► MediaModule, SeoModule, PublishingModule, OrderingModule, RevisionsModule
   FormsModule     ──imports──► CommonModule, EventsModule    (no Media/Seo/Publishing/Ordering needed)
```

Rules (revised from v1):
- `CommonModule` has no dependencies — still the base every other module imports directly, per-module, rather than transitively through a barrel.
- `EventsModule` depends only on `CommonModule` and the NestJS event-emitter package.
- `SiteModule`, `SeoModule`, `PublishingModule`, `OrderingModule` each depend only on `CommonModule`.
- `MediaModule` depends on `CommonModule`, `SiteModule`, `EventsModule` — declared explicitly in `media.module.ts`'s own `imports`.
- `RevisionsModule` depends on `CommonModule`, `EventsModule` only — still has zero dependency on `MediaModule`/`SeoModule`/`PublishingModule`/`OrderingModule`, unchanged from v1.
- `WebsiteModule` imports all eight kernel modules so they're registered in the application graph, but does not export them further — it is the top of the tree, not a pass-through.
- Every future `content/*` module declares its own `imports` array naming exactly the kernel modules it uses — no module receives kernel capabilities it didn't explicitly ask for.
- Dependency direction is still strictly one-way and outward from the kernel — this refinement changes *how consumers opt in*, not the direction or shape of the underlying dependencies.

---

## Refinement 2: Generalized Storage Abstraction

**Updated Media Architecture (§7 delta) — storage description only; upload flow, variant generation, folders, usage tracking, and archive/purge behavior are all unchanged from v1.**

- The abstraction is the **`StorageProvider` interface** — `upload(file) → {url, storageKey}`, `delete(storageKey)`, `getUrl(storageKey)` — exactly as defined in v1. What changes is how its implementations are described:

- **Official implementations, two:**
  - **`LocalStorageProvider`** — filesystem-backed, Phase 0 default, unchanged from v1.
  - **`S3CompatibleStorageProvider`** — a single implementation targeting the **S3 API surface**, not a bespoke "AWS-only" client. Because AWS S3, Cloudflare R2, MinIO, and DigitalOcean Spaces all speak the same S3-compatible API (bucket/key operations, presigned URLs, standard auth headers), one implementation — configured with an endpoint URL, region, bucket name, and credentials — works against any of them. Switching providers (e.g. from DigitalOcean Spaces to Cloudflare R2) is a **configuration change** (endpoint + credentials), not a new class and not a `MediaService` change.

- **What does not change:** `MediaService` only ever depends on the `StorageProvider` interface, never on a concrete implementation — this was already true in v1 and remains exactly as designed. Generalizing `S3StorageProvider` → `S3CompatibleStorageProvider` is a naming/scope correction to reflect what was always structurally true (an S3-API client works against any S3-compatible endpoint), not a new capability being added.

- **No new infrastructure introduced:** this is still exactly two implementations, selected by configuration, with no provider-discovery mechanism, no plugin system, and no per-environment code branching beyond the config value that was already part of v1's design.

### Updated Folder Structure (§3, storage sub-path only)

```
core/media/storage/
├── storage.interface.ts
├── local-storage.provider.ts
└── s3-compatible-storage.provider.ts   (renamed from s3-storage.provider.ts — same responsibilities,
                                          explicitly scoped to any S3-compatible endpoint)
```

---

## Everything Else

Sections 1 (Goals), 2 (Responsibilities), 4 (Database Tables), 5 (Entity Relationships), 6 (Shared Base Classes), 8 (SEO Architecture), 9 (Publishing Architecture), 10 (Ordering Architecture), 11 (Site Architecture), 12 (Events Architecture), 13 (Revision Architecture), 14 (Permission Architecture), 15 (Service Responsibilities), 17 (Public Contracts), 18 (Admin Contracts), 19 (Migration Strategy), and 20 (Testing Strategy) are **unchanged from Phase 0 Technical Design v1** and remain in full effect. Where v1's text refers to "`WebsiteCoreModule`" or "`S3StorageProvider`" incidentally (e.g. in the Service Responsibilities table's "Depends on" column, or the Testing Strategy's mention of testing both storage providers), those references should be read as `WebsiteModule`'s per-module imports and `S3CompatibleStorageProvider` respectively — no other content in those sections changes in substance.
