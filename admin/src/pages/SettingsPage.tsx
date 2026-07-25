/**
 * Settings page — route glue only.
 *
 * Sprint 1.5/1.6: this file held a placeholder (`PageContainer` >
 * `Breadcrumb` > `PageHeader` > empty `Section`) directly.
 * Sprint 3.7: the real Site Settings page now lives in
 * `features/cms/site-settings/SiteSettingsPage.tsx` — feature-owned UI
 * belongs in the feature folder, same convention `pages/MediaPage.tsx`
 * follows for Media (see that file's comment). This file just
 * re-exports it so `routes/index.tsx`'s existing
 * `import { SettingsPage } from "@/pages/SettingsPage"` keeps working
 * unchanged.
 */
export { SiteSettingsPage as SettingsPage } from "@/features/cms/site-settings";
