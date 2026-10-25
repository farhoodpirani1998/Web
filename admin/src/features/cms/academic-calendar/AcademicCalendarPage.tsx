import { useState } from "react";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";
import { ApiError } from "@/lib/apiError";

import { reorderAcademicCalendarEntries, updateAcademicCalendarEntryStatus } from "./api";
import { AcademicCalendarDeleteConfirm } from "./AcademicCalendarDeleteConfirm";
import { AcademicCalendarForm } from "./AcademicCalendarForm";
import { AcademicCalendarList } from "./AcademicCalendarList";
import { useAcademicCalendar } from "./hooks/useAcademicCalendar";
import {
  ACADEMIC_CALENDAR_KIND_LABELS,
  type AcademicCalendarEntryKind,
  type CmsAcademicCalendarEntry,
  type CmsAcademicCalendarStatus,
} from "./types";

/**
 * The Academic Calendar admin page (`/admin/academic-calendar`). Manages
 * the entries across the calendar page's five sections; every entry
 * shares the `admin/academic-calendar-entries` CRUD surface, filtered
 * here by kind + status.
 */
export function AcademicCalendarPage() {
  const [status, setStatus] = useState<CmsAcademicCalendarStatus | undefined>(undefined);
  const [kind, setKind] = useState<AcademicCalendarEntryKind | undefined>(undefined);
  const { entries, isLoading, error, refetch, setEntries } = useAcademicCalendar({ status, kind });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<CmsAcademicCalendarEntry | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CmsAcademicCalendarEntry | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isFiltered = status !== undefined || kind !== undefined;

  function handleCreate() {
    setEditing(null);
    setIsFormOpen(true);
  }

  function handleSaved() {
    setIsFormOpen(false);
    setEditing(null);
    refetch();
  }

  function handleDeleted() {
    setPendingDelete(null);
    refetch();
  }

  async function handleChangeStatus(entry: CmsAcademicCalendarEntry, nextStatus: CmsAcademicCalendarStatus) {
    setActionError(null);
    setUpdatingStatusId(entry.id);
    try {
      const updated = await updateAcademicCalendarEntryStatus(entry.id, nextStatus);
      setEntries((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleReorder(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= entries.length) return;

    const reordered = [...entries];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    const previous = entries;
    setEntries(reordered);
    setActionError(null);
    setIsReordering(true);
    try {
      await reorderAcademicCalendarEntries(reordered.map((item) => item.id));
    } catch (err) {
      setEntries(previous);
      setActionError(
        err instanceof ApiError ? err.message : "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setIsReordering(false);
    }
  }

  const selectClass =
    "rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "داشبورد" }, { label: "تقویم آموزشی" }]} />

      <PermissionGate
        permission="website.content:read"
        fallback={
          <>
            <PageHeader title="تقویم آموزشی" />
            <Section>
              <EmptyState
                title="به تقویم آموزشی دسترسی ندارید"
                description="مشاهده تقویم آموزشی نیازمند دسترسی محتوا است."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="تقویم آموزشی"
          description="مدیریت ورودی‌های صفحه تقویم آموزشی سایت."
        >
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={handleCreate}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              ورودی جدید
            </button>
          </PermissionGate>
        </PageHeader>

        <Section>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <select
                aria-label="فیلتر نوع"
                value={kind ?? ""}
                onChange={(event) =>
                  setKind((event.target.value || undefined) as AcademicCalendarEntryKind | undefined)
                }
                className={selectClass}
              >
                <option value="">همه نوع‌ها</option>
                {(Object.keys(ACADEMIC_CALENDAR_KIND_LABELS) as AcademicCalendarEntryKind[]).map(
                  (value) => (
                    <option key={value} value={value}>
                      {ACADEMIC_CALENDAR_KIND_LABELS[value]}
                    </option>
                  ),
                )}
              </select>

              <select
                aria-label="فیلتر وضعیت"
                value={status ?? ""}
                onChange={(event) =>
                  setStatus((event.target.value || undefined) as CmsAcademicCalendarStatus | undefined)
                }
                className={selectClass}
              >
                <option value="">همه وضعیت‌ها</option>
                <option value="draft">پیش‌نویس</option>
                <option value="published">منتشرشده</option>
                <option value="archived">بایگانی</option>
              </select>

              {isFiltered ? (
                <span className="text-xs text-slate-500">
                  برای مرتب‌سازی، فیلترها را بردارید.
                </span>
              ) : null}
            </div>

            {actionError ? (
              <p role="alert" className="text-sm text-red-600">
                {actionError}
              </p>
            ) : null}

            <AcademicCalendarList
              entries={entries}
              isLoading={isLoading}
              error={error}
              isFiltered={isFiltered}
              updatingStatusId={updatingStatusId}
              isReordering={isReordering}
              onEdit={(entry) => {
                setEditing(entry);
                setIsFormOpen(true);
              }}
              onDeleteRequest={setPendingDelete}
              onChangeStatus={handleChangeStatus}
              onReorder={handleReorder}
              kindLabel={(value) => ACADEMIC_CALENDAR_KIND_LABELS[value]}
            />
          </div>
        </Section>

        {isFormOpen ? (
          <AcademicCalendarForm
            entry={editing}
            onCancel={() => setIsFormOpen(false)}
            onSaved={handleSaved}
          />
        ) : null}

        {pendingDelete ? (
          <AcademicCalendarDeleteConfirm
            entry={pendingDelete}
            onCancel={() => setPendingDelete(null)}
            onDeleted={handleDeleted}
          />
        ) : null}
      </PermissionGate>
    </PageContainer>
  );
}
