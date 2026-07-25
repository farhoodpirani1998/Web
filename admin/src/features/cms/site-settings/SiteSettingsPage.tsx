import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";

import { SettingsForm } from "./SettingsForm";
import { useSiteSettings } from "./hooks/useSiteSettings";

/**
 * The Site Settings page (`/admin/settings`, wired via
 * `pages/SettingsPage.tsx` — same "feature-owned UI, page file just
 * re-exports it" convention `pages/MediaPage.tsx`/`pages/FaqPage.tsx`
 * established for Media/FAQ).
 *
 * Gated behind `website.content:read` for the entire page body,
 * matching `SiteSettingsController.get()`'s own
 * `@RequireCmsPermission(CONTENT_READ)` — a user without it can't view
 * settings at all. Each section's own Save button is gated again at
 * `SettingsForm`'s level behind `website.content:write`, matching the
 * layered-gating approach `FaqPage`/`MediaPage` use.
 *
 * Owns only the singleton fetch (`useSiteSettings`) — `SettingsForm`
 * owns all of its own section-local form state, since (unlike
 * `FaqPage`'s list) there's no shared cross-section state to lift here.
 */
export function SiteSettingsPage() {
  const { settings, isLoading, error, setSettings } = useSiteSettings();

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "Dashboard" }, { label: "Settings" }]} />

      <PermissionGate
        permission="website.content:read"
        fallback={
          <>
            <PageHeader title="Settings" />
            <Section>
              <EmptyState
                title="You don't have access to Settings"
                description="Viewing site settings requires the Content permission. Contact an admin if you need access."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="Settings"
          description="General site information, contact details, and social links."
        />

        <Section>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-slate-500">Loading settings…</p>
          ) : error ? (
            <p className="py-8 text-center text-sm text-red-600">{error.message}</p>
          ) : settings ? (
            <SettingsForm settings={settings} onSaved={setSettings} />
          ) : null}
        </Section>
      </PermissionGate>
    </PageContainer>
  );
}
