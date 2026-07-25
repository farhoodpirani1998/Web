import { useState } from "react";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";
import { ApiError } from "@/lib/apiError";

import { reorderCampuses, scheduleCampus, updateCampusStatus } from "./api";
import { CampusDeleteConfirm } from "./CampusDeleteConfirm";
import { CampusForm } from "./CampusForm";
import { CampusList } from "./CampusList";
import { CampusRevisionsPanel } from "./CampusRevisionsPanel";
import { CampusStatusFilter } from "./CampusStatusFilter";
import { useCampuses } from "./hooks/useCampuses";
import type { CmsCampus, CmsCampusStatus } from "./types";

/**
 * The Campuses admin page (`/admin/campuses`, wired via
 * `pages/CampusesPage.tsx` — same "feature-owned UI, page file just
 * re-exports it" convention `pages/EventsPage.tsx`/`pages/TeachersPage.tsx`
 * established).
 *
 * Gated behind `website.content:read` for the entire page body,
 * matching `CampusesController`'s own
 * `@RequireCmsPermission(CONTENT_READ)` on every GET — a user without
 * it can't view campuses at all, not just edit them. Write/publish/
 * revisions actions are gated again at the control level (`CampusRow`,
 * `CampusStatusControl`, `CampusScheduleControl`,
 * `CampusRevisionsPanel`), same layered-gating approach
 * `EventsPage`/`TeachersPage` use.
 *
 * Owns the state that ties the child components together: the status
 * filter (fed into `useCampuses`), which dialog (if any) is open,
 * which campus is mid-status-change/mid-schedule-change, whether a
 * reorder is in flight, and which campus's revision history panel (if
 * any) is open. Combines `TeacherPage`'s drag-reorder state (Campuses
 * has a `position`/`reorder` endpoint) with `EventsPage`'s schedule/
 * history state (Campuses is also revision-enabled and schedulable) —
 * see `types.ts`'s top comment for why Campuses needs both.
 */
export function CampusesPage() {
  const [status, setStatus] = useState<CmsCampusStatus | undefined>(undefined);
  const { campuses, isLoading, error, refetch, setCampuses } = useCampuses(status);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCampus, setEditingCampus] = useState<CmsCampus | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CmsCampus | null>(null);
  const [historyCampus, setHistoryCampus] = useState<CmsCampus | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [updatingScheduleId, setUpdatingScheduleId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  function handleCreate() {
    setEditingCampus(null);
    setIsFormOpen(true);
  }

  function handleEdit(campus: CmsCampus) {
    setEditingCampus(campus);
    setIsFormOpen(true);
  }

  function handleSaved() {
    setIsFormOpen(false);
    setEditingCampus(null);
    refetch();
  }

  function handleDeleted() {
    setPendingDelete(null);
    refetch();
  }

  function handleRestored(restored: CmsCampus) {
    setCampuses((current) => current.map((item) => (item.id === restored.id ? restored : item)));
    setHistoryCampus(null);
  }

  async function handleChangeStatus(campus: CmsCampus, nextStatus: CmsCampusStatus) {
    setActionError(null);
    setUpdatingStatusId(campus.id);

    try {
      const updated = await updateCampusStatus(campus.id, nextStatus);
      setCampuses((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleSchedule(campus: CmsCampus, publishAt: string | null) {
    setActionError(null);
    setUpdatingScheduleId(campus.id);

    try {
      const updated = await scheduleCampus(campus.id, { publishAt });
      setCampuses((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setUpdatingScheduleId(null);
    }
  }

  async function handleReorder(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= campuses.length) return;

    const reordered = [...campuses];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    // Optimistic: update the visible order immediately and roll back on
    // failure. `PATCH /campuses/reorder` returns void
    // (`CampusesService.reorder`), so there's no response body to
    // reconcile against — only whether the call succeeded. Same
    // reasoning as `TeachersPage.handleReorder`.
    const previous = campuses;
    setCampuses(reordered);
    setActionError(null);
    setIsReordering(true);

    try {
      await reorderCampuses(reordered.map((item) => item.id));
    } catch (err) {
      setCampuses(previous);
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setIsReordering(false);
    }
  }

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "Dashboard" }, { label: "Campuses" }]} />

      <PermissionGate
        permission="website.content:read"
        fallback={
          <>
            <PageHeader title="Campuses" />
            <Section>
              <EmptyState
                title="You don't have access to Campuses"
                description="Viewing campuses requires the Content permission. Contact an admin if you need access."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="Campuses"
          description="Manage the physical campuses/branches shown on the public site."
        >
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={handleCreate}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              New campus
            </button>
          </PermissionGate>
        </PageHeader>

        <Section>
          <div className="flex flex-col gap-4">
            <CampusStatusFilter value={status} onChange={setStatus} />

            {actionError ? (
              <p role="alert" className="text-sm text-red-600">
                {actionError}
              </p>
            ) : null}

            <CampusList
              campuses={campuses}
              isLoading={isLoading}
              error={error}
              status={status}
              updatingStatusId={updatingStatusId}
              updatingScheduleId={updatingScheduleId}
              isReordering={isReordering}
              onEdit={handleEdit}
              onDeleteRequest={setPendingDelete}
              onChangeStatus={handleChangeStatus}
              onSchedule={handleSchedule}
              onViewHistory={setHistoryCampus}
              onReorder={handleReorder}
            />
          </div>
        </Section>

        {isFormOpen ? (
          <CampusForm
            campus={editingCampus}
            onCancel={() => setIsFormOpen(false)}
            onSaved={handleSaved}
          />
        ) : null}

        {pendingDelete ? (
          <CampusDeleteConfirm
            campus={pendingDelete}
            onCancel={() => setPendingDelete(null)}
            onDeleted={handleDeleted}
          />
        ) : null}

        {historyCampus ? (
          <CampusRevisionsPanel
            campus={historyCampus}
            onClose={() => setHistoryCampus(null)}
            onRestored={handleRestored}
          />
        ) : null}
      </PermissionGate>
    </PageContainer>
  );
}
