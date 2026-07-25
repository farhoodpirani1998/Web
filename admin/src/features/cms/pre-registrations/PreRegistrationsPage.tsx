import { useState } from "react";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";
import { ApiError } from "@/lib/apiError";

import { updatePreRegistrationStatus } from "./api";
import { PreRegistrationDeleteConfirm } from "./PreRegistrationDeleteConfirm";
import { PreRegistrationDetail } from "./PreRegistrationDetail";
import { PreRegistrationList } from "./PreRegistrationList";
import { PreRegistrationStatusFilter } from "./PreRegistrationStatusFilter";
import { usePreRegistrations } from "./hooks/usePreRegistrations";
import type { CmsPreRegistration, CmsPreRegistrationStatus } from "./types";

/**
 * The Pre-Registrations admin page (`/admin/pre-registrations`, wired
 * via `pages/PreRegistrationsPage.tsx` — same "feature-owned UI, page
 * file just re-exports it" convention every other CMS module follows).
 *
 * Gated behind `website.content:read` for the entire page body,
 * matching `PreRegistrationsController`'s own
 * `@RequireCmsPermission(CONTENT_READ)` on every GET. Status changes
 * and delete are gated again at the control level (`PreRegistrationRow`,
 * `PreRegistrationStatusControl`, `PreRegistrationDetail`), same
 * layered-gating approach `FaqPage`/`PortalLinksPage` use.
 *
 * No create/new-submission action in the header (unlike `FaqPage`'s
 * "New FAQ" button) — submissions only ever arrive via the public
 * site's own form, this admin surface only triages what's already
 * there. No reorder either: this list has no manual ordering, see
 * `types.ts`.
 */
export function PreRegistrationsPage() {
  const [status, setStatus] = useState<CmsPreRegistrationStatus | undefined>(undefined);
  const { preRegistrations, isLoading, error, refetch, setPreRegistrations } =
    usePreRegistrations(status);

  const [viewingDetailId, setViewingDetailId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CmsPreRegistration | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const viewingDetail = preRegistrations.find((item) => item.id === viewingDetailId) ?? null;

  function handleDeleted() {
    setPendingDelete(null);
    refetch();
  }

  async function handleChangeStatus(
    preRegistration: CmsPreRegistration,
    nextStatus: CmsPreRegistrationStatus,
  ) {
    setActionError(null);
    setUpdatingStatusId(preRegistration.id);

    try {
      const updated = await updatePreRegistrationStatus(preRegistration.id, {
        status: nextStatus,
      });
      setPreRegistrations((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "Dashboard" }, { label: "Pre-Registrations" }]} />

      <PermissionGate
        permission="website.content:read"
        fallback={
          <>
            <PageHeader title="Pre-Registrations" />
            <Section>
              <EmptyState
                title="You don't have access to Pre-Registrations"
                description="Viewing pre-registrations requires the Content permission. Contact an admin if you need access."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="Pre-Registrations"
          description="Review and triage pre-registration submissions from the public site."
        />

        <Section>
          <div className="flex flex-col gap-4">
            <PreRegistrationStatusFilter value={status} onChange={setStatus} />

            {actionError ? (
              <p role="alert" className="text-sm text-red-600">
                {actionError}
              </p>
            ) : null}

            <PreRegistrationList
              preRegistrations={preRegistrations}
              isLoading={isLoading}
              error={error}
              statusFilter={status}
              updatingStatusId={updatingStatusId}
              onViewDetail={(item) => setViewingDetailId(item.id)}
              onDeleteRequest={setPendingDelete}
              onChangeStatus={handleChangeStatus}
            />
          </div>
        </Section>

        {viewingDetail ? (
          <PreRegistrationDetail
            preRegistration={viewingDetail}
            isUpdatingStatus={updatingStatusId === viewingDetail.id}
            onClose={() => setViewingDetailId(null)}
            onChangeStatus={(next) => handleChangeStatus(viewingDetail, next)}
          />
        ) : null}

        {pendingDelete ? (
          <PreRegistrationDeleteConfirm
            preRegistration={pendingDelete}
            onCancel={() => setPendingDelete(null)}
            onDeleted={handleDeleted}
          />
        ) : null}
      </PermissionGate>
    </PageContainer>
  );
}
