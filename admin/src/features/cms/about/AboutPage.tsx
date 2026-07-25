import { useState } from "react";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";
import { ApiError } from "@/lib/apiError";

import { AboutForm } from "./AboutForm";
import { AboutRevisionsPanel } from "./AboutRevisionsPanel";
import { AboutStatusControl } from "./AboutStatusControl";
import { updateAboutStatus } from "./api";
import { useAbout } from "./hooks/useAbout";
import type { CmsAboutStatus } from "./types";

/**
 * The About admin page (`/admin/about`, wired via `pages/AboutPage.tsx`
 * — same "feature-owned UI, page file just re-exports it" convention
 * `pages/CampusesPage.tsx`/`pages/SettingsPage.tsx` established).
 *
 * Gated behind `website.content:read` for the entire page body,
 * matching `AboutController.get()`'s own `@RequireCmsPermission(CONTENT_READ)`
 * — a user without it can't view the About page at all. Write/publish/
 * revisions actions are gated again at the control level (`AboutForm`,
 * `AboutStatusControl`, `AboutRevisionsPanel`), same layered-gating
 * approach every other CMS page uses.
 *
 * About is a singleton (see `types.ts`'s top comment), so this page
 * has no list/create/delete/reorder — it's shaped like
 * `SiteSettingsPage` (one row, always present after the initial
 * fetch) plus the status control and revisions history that Site
 * Settings doesn't have, since About (unlike Site Settings) carries a
 * publish `status` and is one of the backend's revision-enabled types.
 */
export function AboutPage() {
  const { about, isLoading, error, setAbout } = useAbout();

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isRevisionsOpen, setIsRevisionsOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleChangeStatus(nextStatus: CmsAboutStatus) {
    setActionError(null);
    setIsUpdatingStatus(true);

    try {
      const updated = await updateAboutStatus(nextStatus);
      setAbout(updated);
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "Dashboard" }, { label: "About" }]} />

      <PermissionGate
        permission="website.content:read"
        fallback={
          <>
            <PageHeader title="About" />
            <Section>
              <EmptyState
                title="You don't have access to the About page"
                description="Viewing the About page requires the Content permission. Contact an admin if you need access."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="About"
          description="Manage the public site's About Us page content, image, and SEO."
        >
          <PermissionGate permission="website.revisions:view">
            <button
              type="button"
              onClick={() => setIsRevisionsOpen(true)}
              disabled={!about}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Revision history
            </button>
          </PermissionGate>
        </PageHeader>

        <Section>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-slate-500">Loading About page…</p>
          ) : error ? (
            <p className="py-8 text-center text-sm text-red-600">{error.message}</p>
          ) : about ? (
            <div className="flex flex-col gap-4">
              <AboutStatusControl
                status={about.status}
                isUpdating={isUpdatingStatus}
                onChangeStatus={handleChangeStatus}
              />

              {actionError ? (
                <p role="alert" className="text-sm text-red-600">
                  {actionError}
                </p>
              ) : null}

              <AboutForm about={about} onSaved={setAbout} />
            </div>
          ) : null}
        </Section>

        {isRevisionsOpen && about ? (
          <AboutRevisionsPanel
            about={about}
            onClose={() => setIsRevisionsOpen(false)}
            onRestored={(restored) => {
              setAbout(restored);
              setIsRevisionsOpen(false);
            }}
          />
        ) : null}
      </PermissionGate>
    </PageContainer>
  );
}
