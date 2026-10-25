import { useState } from "react";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";
import { ApiError } from "@/lib/apiError";

import { reorderAdmissionEntries, updateAdmissionEntryStatus } from "./api";
import { AdmissionDeleteConfirm } from "./AdmissionDeleteConfirm";
import { AdmissionForm } from "./AdmissionForm";
import { AdmissionList } from "./AdmissionList";
import { useAdmissions } from "./hooks/useAdmissions";
import {
  ADMISSION_KIND_LABELS,
  type AdmissionEntryKind,
  type CmsAdmissionEntry,
  type CmsAdmissionStatus,
} from "./types";

/**
 * The Admissions admin page (`/admin/admissions`). Manages the entries
 * across the admissions page's four sections.
 */
export function AdmissionsPage() {
  const [status, setStatus] = useState<CmsAdmissionStatus | undefined>(undefined);
  const [kind, setKind] = useState<AdmissionEntryKind | undefined>(undefined);
  const { entries, isLoading, error, refetch, setEntries } = useAdmissions({ status, kind });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<CmsAdmissionEntry | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CmsAdmissionEntry | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isFiltered = status !== undefined || kind !== undefined;

  function handleSaved() {
    setIsFormOpen(false);
    setEditing(null);
    refetch();
  }

  async function handleChangeStatus(entry: CmsAdmissionEntry, nextStatus: CmsAdmissionStatus) {
    setActionError(null);
    setUpdatingStatusId(entry.id);
    try {
      const updated = await updateAdmissionEntryStatus(entry.id, nextStatus);
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
      await reorderAdmissionEntries(reordered.map((item) => item.id));
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
      <Breadcrumb items={[{ label: "داشبورد" }, { label: "پذیرش" }]} />

      <PermissionGate
        permission="website.content:read"
        fallback={
          <>
            <PageHeader title="پذیرش" />
            <Section>
              <EmptyState
                title="به بخش پذیرش دسترسی ندارید"
                description="مشاهده بخش پذیرش نیازمند دسترسی محتوا است."
              />
            </Section>
          </>
        }
      >
        <PageHeader title="پذیرش" description="مدیریت ورودی‌های صفحه پذیرش و ثبت‌نام سایت.">
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setIsFormOpen(true);
              }}
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
                  setKind((event.target.value || undefined) as AdmissionEntryKind | undefined)
                }
                className={selectClass}
              >
                <option value="">همه نوع‌ها</option>
                {(Object.keys(ADMISSION_KIND_LABELS) as AdmissionEntryKind[]).map((value) => (
                  <option key={value} value={value}>
                    {ADMISSION_KIND_LABELS[value]}
                  </option>
                ))}
              </select>

              <select
                aria-label="فیلتر وضعیت"
                value={status ?? ""}
                onChange={(event) =>
                  setStatus((event.target.value || undefined) as CmsAdmissionStatus | undefined)
                }
                className={selectClass}
              >
                <option value="">همه وضعیت‌ها</option>
                <option value="draft">پیش‌نویس</option>
                <option value="published">منتشرشده</option>
                <option value="archived">بایگانی</option>
              </select>

              {isFiltered ? (
                <span className="text-xs text-slate-500">برای مرتب‌سازی، فیلترها را بردارید.</span>
              ) : null}
            </div>

            {actionError ? (
              <p role="alert" className="text-sm text-red-600">
                {actionError}
              </p>
            ) : null}

            <AdmissionList
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
            />
          </div>
        </Section>

        {isFormOpen ? (
          <AdmissionForm
            entry={editing}
            onCancel={() => setIsFormOpen(false)}
            onSaved={handleSaved}
          />
        ) : null}

        {pendingDelete ? (
          <AdmissionDeleteConfirm
            entry={pendingDelete}
            onCancel={() => setPendingDelete(null)}
            onDeleted={() => {
              setPendingDelete(null);
              refetch();
            }}
          />
        ) : null}
      </PermissionGate>
    </PageContainer>
  );
}
