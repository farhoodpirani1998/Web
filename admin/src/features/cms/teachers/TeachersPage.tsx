import { useState } from "react";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";
import { ApiError } from "@/lib/apiError";

import { reorderTeachers, scheduleTeacher, updateTeacherStatus } from "./api";
import { TeacherDeleteConfirm } from "./TeacherDeleteConfirm";
import { TeacherForm } from "./TeacherForm";
import { TeacherList } from "./TeacherList";
import { TeacherRevisionsPanel } from "./TeacherRevisionsPanel";
import { TeacherStatusFilter } from "./TeacherStatusFilter";
import { useTeachers } from "./hooks/useTeachers";
import type { CmsTeacher, CmsTeacherStatus } from "./types";

/**
 * The Teachers admin page (`/admin/teachers`, wired via
 * `pages/TeachersPage.tsx` — same "feature-owned UI, page file just
 * re-exports it" convention `pages/EventsPage.tsx`/`pages/NewsPage.tsx`
 * established).
 *
 * Gated behind `website.content:read` for the entire page body,
 * matching `TeachersController`'s own
 * `@RequireCmsPermission(CONTENT_READ)` on every GET — a user without
 * it can't view teachers at all, not just edit them. Write/publish/
 * revisions actions are gated again at the control level (`TeacherRow`,
 * `TeacherStatusControl`, `TeacherScheduleControl`,
 * `TeacherRevisionsPanel`), same layered-gating approach
 * `EventsPage`/`FaqPage` use.
 *
 * Owns the state that ties the child components together: the status
 * filter (fed into `useTeachers`), which dialog (if any) is open,
 * which teacher is mid-status-change/mid-schedule-change, whether a
 * reorder is in flight, and which teacher's revision history panel (if
 * any) is open. Combines `FaqPage`'s drag-reorder state (Teachers has
 * a `position`/`reorder` endpoint) with `EventsPage`'s schedule/history
 * state (Teachers is also revision-enabled and schedulable) — see
 * `types.ts`'s top comment for why Teachers needs both.
 */
export function TeachersPage() {
  const [status, setStatus] = useState<CmsTeacherStatus | undefined>(undefined);
  const { teachers, isLoading, error, refetch, setTeachers } = useTeachers(status);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<CmsTeacher | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CmsTeacher | null>(null);
  const [historyTeacher, setHistoryTeacher] = useState<CmsTeacher | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [updatingScheduleId, setUpdatingScheduleId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  function handleCreate() {
    setEditingTeacher(null);
    setIsFormOpen(true);
  }

  function handleEdit(teacher: CmsTeacher) {
    setEditingTeacher(teacher);
    setIsFormOpen(true);
  }

  function handleSaved() {
    setIsFormOpen(false);
    setEditingTeacher(null);
    refetch();
  }

  function handleDeleted() {
    setPendingDelete(null);
    refetch();
  }

  function handleRestored(restored: CmsTeacher) {
    setTeachers((current) => current.map((item) => (item.id === restored.id ? restored : item)));
    setHistoryTeacher(null);
  }

  async function handleChangeStatus(teacher: CmsTeacher, nextStatus: CmsTeacherStatus) {
    setActionError(null);
    setUpdatingStatusId(teacher.id);

    try {
      const updated = await updateTeacherStatus(teacher.id, nextStatus);
      setTeachers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleSchedule(teacher: CmsTeacher, publishAt: string | null) {
    setActionError(null);
    setUpdatingScheduleId(teacher.id);

    try {
      const updated = await scheduleTeacher(teacher.id, { publishAt });
      setTeachers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setUpdatingScheduleId(null);
    }
  }

  async function handleReorder(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= teachers.length) return;

    const reordered = [...teachers];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    // Optimistic: update the visible order immediately and roll back on
    // failure. `PATCH /teachers/reorder` returns void
    // (`TeachersService.reorder`), so there's no response body to
    // reconcile against — only whether the call succeeded. Same
    // reasoning as `FaqPage.handleReorder`.
    const previous = teachers;
    setTeachers(reordered);
    setActionError(null);
    setIsReordering(true);

    try {
      await reorderTeachers(reordered.map((item) => item.id));
    } catch (err) {
      setTeachers(previous);
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setIsReordering(false);
    }
  }

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "Dashboard" }, { label: "Teachers" }]} />

      <PermissionGate
        permission="website.content:read"
        fallback={
          <>
            <PageHeader title="Teachers" />
            <Section>
              <EmptyState
                title="You don't have access to Teachers"
                description="Viewing teachers requires the Content permission. Contact an admin if you need access."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="Teachers"
          description="Manage the teacher/staff profiles shown on the public site."
        >
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={handleCreate}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              New teacher
            </button>
          </PermissionGate>
        </PageHeader>

        <Section>
          <div className="flex flex-col gap-4">
            <TeacherStatusFilter value={status} onChange={setStatus} />

            {actionError ? (
              <p role="alert" className="text-sm text-red-600">
                {actionError}
              </p>
            ) : null}

            <TeacherList
              teachers={teachers}
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
              onViewHistory={setHistoryTeacher}
              onReorder={handleReorder}
            />
          </div>
        </Section>

        {isFormOpen ? (
          <TeacherForm
            teacher={editingTeacher}
            onCancel={() => setIsFormOpen(false)}
            onSaved={handleSaved}
          />
        ) : null}

        {pendingDelete ? (
          <TeacherDeleteConfirm
            teacher={pendingDelete}
            onCancel={() => setPendingDelete(null)}
            onDeleted={handleDeleted}
          />
        ) : null}

        {historyTeacher ? (
          <TeacherRevisionsPanel
            teacher={historyTeacher}
            onClose={() => setHistoryTeacher(null)}
            onRestored={handleRestored}
          />
        ) : null}
      </PermissionGate>
    </PageContainer>
  );
}
