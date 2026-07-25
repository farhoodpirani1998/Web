import { useState } from "react";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";
import { ApiError } from "@/lib/apiError";

import { reorderFeatures, updateFeatureStatus } from "./api";
import { FeatureDeleteConfirm } from "./FeatureDeleteConfirm";
import { FeatureForm } from "./FeatureForm";
import { FeatureList } from "./FeatureList";
import { FeatureStatusFilter } from "./FeatureStatusFilter";
import { useFeatures } from "./hooks/useFeatures";
import type { CmsFeature, CmsFeatureStatus } from "./types";

/**
 * The Features admin page (`/admin/features`, wired via
 * `pages/FeaturesPage.tsx` — same "feature-owned UI, page file just
 * re-exports it" convention `pages/FaqPage.tsx` established for FAQ).
 *
 * Gated behind `website.content:read` for the entire page body,
 * matching `FeaturesController`'s own
 * `@RequireCmsPermission(CONTENT_READ)` on every GET — a user without it
 * can't view Features at all, not just edit them. Write/publish actions
 * are gated again at the control level (`FeatureRow`,
 * `FeatureStatusControl`), same layered-gating approach `FaqPage` uses.
 *
 * Owns the state that ties the child components together: the status
 * filter (fed into `useFeatures`), which dialog (if any) is open, which
 * Feature is mid-status-change, and whether a reorder is in flight.
 */
export function FeaturesPage() {
  const [status, setStatus] = useState<CmsFeatureStatus | undefined>(undefined);
  const { features, isLoading, error, refetch, setFeatures } = useFeatures(status);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<CmsFeature | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CmsFeature | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  function handleCreate() {
    setEditingFeature(null);
    setIsFormOpen(true);
  }

  function handleEdit(feature: CmsFeature) {
    setEditingFeature(feature);
    setIsFormOpen(true);
  }

  function handleSaved() {
    setIsFormOpen(false);
    setEditingFeature(null);
    refetch();
  }

  function handleDeleted() {
    setPendingDelete(null);
    refetch();
  }

  async function handleChangeStatus(feature: CmsFeature, nextStatus: CmsFeatureStatus) {
    setActionError(null);
    setUpdatingStatusId(feature.id);

    try {
      const updated = await updateFeatureStatus(feature.id, nextStatus);
      setFeatures((current) =>
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

  async function handleReorder(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= features.length) return;

    const reordered = [...features];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    // Optimistic: update the visible order immediately and roll back on
    // failure. `PATCH /features/reorder` returns void
    // (`FeaturesService.reorder`), so there's no response body to
    // reconcile against — only whether the call succeeded.
    const previous = features;
    setFeatures(reordered);
    setActionError(null);
    setIsReordering(true);

    try {
      await reorderFeatures(reordered.map((item) => item.id));
    } catch (err) {
      setFeatures(previous);
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setIsReordering(false);
    }
  }

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "Dashboard" }, { label: "Features" }]} />

      <PermissionGate
        permission="website.content:read"
        fallback={
          <>
            <PageHeader title="Features" />
            <Section>
              <EmptyState
                title="You don't have access to Features"
                description="Viewing Features requires the Content permission. Contact an admin if you need access."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="Features"
          description="Manage the highlight cards shown on the public site's features section."
        >
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={handleCreate}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              New Feature
            </button>
          </PermissionGate>
        </PageHeader>

        <Section>
          <div className="flex flex-col gap-4">
            <FeatureStatusFilter value={status} onChange={setStatus} />

            {actionError ? (
              <p role="alert" className="text-sm text-red-600">
                {actionError}
              </p>
            ) : null}

            <FeatureList
              features={features}
              isLoading={isLoading}
              error={error}
              status={status}
              updatingStatusId={updatingStatusId}
              isReordering={isReordering}
              onEdit={handleEdit}
              onDeleteRequest={setPendingDelete}
              onChangeStatus={handleChangeStatus}
              onReorder={handleReorder}
            />
          </div>
        </Section>

        {isFormOpen ? (
          <FeatureForm
            feature={editingFeature}
            onCancel={() => setIsFormOpen(false)}
            onSaved={handleSaved}
          />
        ) : null}

        {pendingDelete ? (
          <FeatureDeleteConfirm
            feature={pendingDelete}
            onCancel={() => setPendingDelete(null)}
            onDeleted={handleDeleted}
          />
        ) : null}
      </PermissionGate>
    </PageContainer>
  );
}
