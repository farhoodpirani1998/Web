import { useState } from "react";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";
import { ApiError } from "@/lib/apiError";

import { reorderStatistics, updateStatisticStatus } from "./api";
import { StatisticDeleteConfirm } from "./StatisticDeleteConfirm";
import { StatisticForm } from "./StatisticForm";
import { StatisticList } from "./StatisticList";
import { StatisticStatusFilter } from "./StatisticStatusFilter";
import { useStatistics } from "./hooks/useStatistics";
import type { CmsStatistic, CmsStatisticStatus } from "./types";

/**
 * The Statistics admin page (`/admin/statistics`, wired via
 * `pages/StatisticsPage.tsx` — same "feature-owned UI, page file just
 * re-exports it" convention `pages/FeaturesPage.tsx` established for
 * Features).
 *
 * Gated behind `website.content:read` for the entire page body,
 * matching `StatisticsController`'s own
 * `@RequireCmsPermission(CONTENT_READ)` on every GET — a user without
 * it can't view Statistics at all, not just edit them. Write/publish
 * actions are gated again at the control level (`StatisticRow`,
 * `StatisticStatusControl`), same layered-gating approach `FeaturesPage`
 * uses.
 *
 * Owns the state that ties the child components together: the status
 * filter (fed into `useStatistics`), which dialog (if any) is open,
 * which Statistic is mid-status-change, and whether a reorder is in
 * flight.
 */
export function StatisticsPage() {
  const [status, setStatus] = useState<CmsStatisticStatus | undefined>(undefined);
  const { statistics, isLoading, error, refetch, setStatistics } = useStatistics(status);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStatistic, setEditingStatistic] = useState<CmsStatistic | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CmsStatistic | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  function handleCreate() {
    setEditingStatistic(null);
    setIsFormOpen(true);
  }

  function handleEdit(statistic: CmsStatistic) {
    setEditingStatistic(statistic);
    setIsFormOpen(true);
  }

  function handleSaved() {
    setIsFormOpen(false);
    setEditingStatistic(null);
    refetch();
  }

  function handleDeleted() {
    setPendingDelete(null);
    refetch();
  }

  async function handleChangeStatus(statistic: CmsStatistic, nextStatus: CmsStatisticStatus) {
    setActionError(null);
    setUpdatingStatusId(statistic.id);

    try {
      const updated = await updateStatisticStatus(statistic.id, nextStatus);
      setStatistics((current) =>
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
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= statistics.length) return;

    const reordered = [...statistics];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    // Optimistic: update the visible order immediately and roll back on
    // failure. `PATCH /statistics/reorder` returns void
    // (`StatisticsService.reorder`), so there's no response body to
    // reconcile against — only whether the call succeeded.
    const previous = statistics;
    setStatistics(reordered);
    setActionError(null);
    setIsReordering(true);

    try {
      await reorderStatistics(reordered.map((item) => item.id));
    } catch (err) {
      setStatistics(previous);
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setIsReordering(false);
    }
  }

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "Dashboard" }, { label: "Statistics" }]} />

      <PermissionGate
        permission="website.content:read"
        fallback={
          <>
            <PageHeader title="Statistics" />
            <Section>
              <EmptyState
                title="You don't have access to Statistics"
                description="Viewing Statistics requires the Content permission. Contact an admin if you need access."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="Statistics"
          description="Manage the stat counters shown on the public site's statistics section."
        >
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={handleCreate}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              New Statistic
            </button>
          </PermissionGate>
        </PageHeader>

        <Section>
          <div className="flex flex-col gap-4">
            <StatisticStatusFilter value={status} onChange={setStatus} />

            {actionError ? (
              <p role="alert" className="text-sm text-red-600">
                {actionError}
              </p>
            ) : null}

            <StatisticList
              statistics={statistics}
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
          <StatisticForm
            statistic={editingStatistic}
            onCancel={() => setIsFormOpen(false)}
            onSaved={handleSaved}
          />
        ) : null}

        {pendingDelete ? (
          <StatisticDeleteConfirm
            statistic={pendingDelete}
            onCancel={() => setPendingDelete(null)}
            onDeleted={handleDeleted}
          />
        ) : null}
      </PermissionGate>
    </PageContainer>
  );
}
