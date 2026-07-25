/**
 * Media page — route glue only.
 *
 * Sprint 1.5/1.6: this file held a placeholder (`PageContainer` >
 * `Breadcrumb` > `PageHeader` > empty `Section`) directly.
 * Sprint 3.5: the real Media Library page now lives in
 * `features/cms/media/MediaPage.tsx`, per that sprint's task ("Location:
 * admin/src/features/cms/media/") — feature-owned UI belongs in the
 * feature folder, same as every other module in `features/cms/`. This
 * file just re-exports it so `routes/index.tsx`'s existing `import {
 * MediaPage } from "@/pages/MediaPage"` keeps working unchanged.
 */
export { MediaPage } from "@/features/cms/media";
