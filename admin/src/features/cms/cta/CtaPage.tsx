import { useState } from "react";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";
import { ApiError } from "@/lib/apiError";

import { CtaForm } from "./CtaForm";
import { CtaStatusControl } from "./CtaStatusControl";
import { updateCtaStatus } from "./api";
import { useCta } from "./hooks/useCta";
import type { CmsCtaStatus } from "./types";

/**
 * The CTA admin page (`/admin/cta`, wired via `pages/CtaPage.tsx` —
 * same "feature-owned UI, page file just re-exports it" convention
 * `pages/AboutPage.tsx` established).
 *
 * Gated behind `website.content:read` for the entire page body,
 * matching `CtaController.get()`'s own `@RequireCmsPermission(CONTENT_READ)`
 * — a user without it can't view the CTA page at all. Write/publish
 * actions are gated again at the control level (`CtaForm`,
 * `CtaStatusControl`), same layered-gating approach every other CMS
 * page uses.
 *
 * CTA is a singleton (see `types.ts`'s top comment), so this page has
 * no list/create/delete/reorder — it's shaped like `AboutPage` minus
 * the revision history button and SEO fieldset (CTA carries neither —
 * see `CtaBanner` entity's doc comment). Whether the banner is shown
 * at all lives in Site Settings' `featureFlags.ctaEnabled`, not here —
 * this page only manages the banner's own content/status.
 */
export function CtaPage() {
  const { cta, isLoading, error, setCta } = useCta();

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleChangeStatus(nextStatus: CmsCtaStatus) {
    setActionError(null);
    setIsUpdatingStatus(true);

    try {
      const updated = await updateCtaStatus(nextStatus);
      setCta(updated);
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
      <Breadcrumb items={[{ label: "Dashboard" }, { label: "CTA" }]} />

      <PermissionGate
        permission="website.content:read"
        fallback={
          <>
            <PageHeader title="CTA" />
            <Section>
              <EmptyState
                title="You don't have access to the CTA page"
                description="Viewing the CTA page requires the Content permission. Contact an admin if you need access."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="CTA"
          description="Manage the site-wide call-to-action banner shown near the bottom of the homepage."
        />

        <Section>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-slate-500">Loading CTA banner…</p>
          ) : error ? (
            <p className="py-8 text-center text-sm text-red-600">{error.message}</p>
          ) : cta ? (
            <div className="flex flex-col gap-4">
              <CtaStatusControl
                status={cta.status}
                isUpdating={isUpdatingStatus}
                onChangeStatus={handleChangeStatus}
              />

              {actionError ? (
                <p role="alert" className="text-sm text-red-600">
                  {actionError}
                </p>
              ) : null}

              <CtaForm cta={cta} onSaved={setCta} />
            </div>
          ) : null}
        </Section>
      </PermissionGate>
    </PageContainer>
  );
}
