import { useState } from "react";

import { BulkActionToolbar } from "@/components/ui/BulkActionToolbar";
import { BulkDeleteConfirm } from "@/components/ui/BulkDeleteConfirm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";
import { useRowSelection } from "@/hooks/useRowSelection";
import { ApiError } from "@/lib/apiError";

import { archiveMedia, deleteMedia } from "./api";
import { evictCachedMedia, setCachedMedia } from "./mediaCache";
import { MediaDeleteConfirm } from "./MediaDeleteConfirm";
import { MediaGrid } from "./MediaGrid";
import { MediaStatusFilter } from "./MediaStatusFilter";
import { MediaUploadDialog } from "./MediaUploadDialog";
import { MediaUsageDialog } from "./MediaUsageDialog";
import type { CmsMedia, CmsMediaStatus } from "./types";
import { useMediaList } from "./useMediaList";

/**
 * The Media Library page (`/admin/media`, wired via `pages/MediaPage.tsx`
 * — see that file for why it just re-exports this one).
 *
 * Gated behind `website.media:manage` for the entire page body, not
 * just individual actions: every `/admin/media` route requires that
 * permission (`MediaController`), including the plain list — so a user
 * without it can't do anything here, not even view. Per the Sprint 3.3
 * audit's flagged (not fixed) gap, `content_editor`/`publisher` don't
 * have this permission today; that's a product decision for the team,
 * not something to work around here (see the fallback message below).
 *
 * Owns the one piece of state that ties the child components together:
 * the status filter (fed into `useMediaList`), which dialog (if any) is
 * open, and which item is mid-archive. Everything else is either local
 * to a child component (`MediaUploadDialog`'s form state,
 * `MediaDeleteConfirm`'s confirm state) or delegated to `useMediaList`.
 *
 * Owns selection state via `useRowSelection`, the same hook
 * `NewsPage`/`PageList`/`TestimonialsPage` use for bulk actions.
 *
 * Media has no `CmsPublishStatus` lifecycle, only `active`/`archived`,
 * so its toolbar offers bulk archive for selected active assets and
 * bulk delete for the full selection.
 *
 * `handleBulkArchive` and `handleConfirmBulkDelete` fire the existing
 * per-item endpoints in parallel via `Promise.allSettled` (there are no
 * bulk endpoints). Successful items are removed from selection; archive
 * successes update the shared media cache, while delete successes evict
 * from it. Partial failures keep failed items selected for retry and
 * report the number of failures.
 *
 */
export function MediaPage() {
  const [status, setStatus] = useState<CmsMediaStatus | undefined>(undefined);
  const { media, isLoading, error, refetch } = useMediaList(status);
  const selection = useRowSelection(media, (item) => item.id);
  const selectedMedia = media.filter((item) => selection.selectedIds.has(item.id));

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<CmsMedia | null>(null);
  const [usageTarget, setUsageTarget] = useState<CmsMedia | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [isBulkArchiving, setIsBulkArchiving] = useState(false);
  const [bulkArchiveError, setBulkArchiveError] = useState<string | null>(null);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);
  const activeSelectedCount = selectedMedia.filter(
    (item) => item.status === "active",
  ).length;
  const isBulkActionPending = isBulkArchiving || isBulkDeleting;

  async function handleArchive(item: CmsMedia) {
    setArchiveError(null);
    setArchivingId(item.id);
    try {
      await archiveMedia(item.id);
      refetch();
    } catch (err) {
      setArchiveError(
        err instanceof ApiError ? err.message : "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setArchivingId(null);
    }
  }

  function handleUploaded() {
    setIsUploadOpen(false);
    refetch();
  }

  function handleDeleted() {
    setPendingDelete(null);
    refetch();
  }

  async function handleBulkArchive() {
    const targets = selectedMedia.filter((item) => item.status === "active");
    if (targets.length === 0) return;

    setBulkArchiveError(null);
    setIsBulkArchiving(true);

    const results = await Promise.allSettled(
      targets.map((item) => archiveMedia(item.id)),
    );
    const succeededIds: string[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const item = targets[index];
        succeededIds.push(item.id);
        setCachedMedia({ ...item, status: "archived" });
      }
    });

    if (succeededIds.length > 0) {
      selection.deselectIds(succeededIds);
      refetch();
    }

    const failedCount = targets.length - succeededIds.length;
    if (failedCount > 0) {
      setBulkArchiveError(
        `Archived ${succeededIds.length} of ${targets.length} selected media assets. ${failedCount} failed — please try again.`,
      );
    }

    setIsBulkArchiving(false);
  }

  async function handleConfirmBulkDelete() {
    setIsBulkDeleting(true);
    setBulkDeleteError(null);

    const targets = selectedMedia;
    const results = await Promise.allSettled(targets.map((item) => deleteMedia(item.id)));

    const succeededIds: string[] = [];
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        succeededIds.push(targets[index].id);
        evictCachedMedia(targets[index].id);
      }
    });

    if (succeededIds.length > 0) {
      selection.deselectIds(succeededIds);
      refetch();
    }

    const failedCount = targets.length - succeededIds.length;
    setIsBulkDeleting(false);

    if (failedCount > 0) {
      setBulkDeleteError(
        `Deleted ${succeededIds.length} of ${targets.length}. ${failedCount} failed — please try again.`,
      );
    } else {
      setIsBulkDeleteConfirmOpen(false);
    }
  }

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "داشبورد" }, { label: "رسانه" }]} />

      <PermissionGate
        permission="website.media:manage"
        fallback={
          <>
            <PageHeader title="رسانه" />
            <Section>
              <EmptyState
                title="به رسانه دسترسی ندارید"
                description="مدیریت رسانه نیازمند دسترسی رسانه است. در صورت نیاز با مدیر تماس بگیرید."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="رسانه"
          description="بارگذاری و مدیریت تصاویر استفاده‌شده در سایت."
        >
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            بارگذاری رسانه
          </button>
        </PageHeader>

        <Section>
          <div className="flex flex-col gap-4">
            <MediaStatusFilter value={status} onChange={setStatus} />

            {archiveError ? (
              <p role="alert" className="text-sm text-red-600">
                {archiveError}
              </p>
            ) : null}
            {bulkArchiveError ? (
              <p role="alert" className="text-sm text-red-600">
                {bulkArchiveError}
              </p>
            ) : null}

            <BulkActionToolbar
              selectedCount={selection.selectedCount}
              onClear={selection.clear}
            >
              <PermissionGate permission="website.media:manage">
                {activeSelectedCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => void handleBulkArchive()}
                    disabled={isBulkActionPending}
                    className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isBulkArchiving
                      ? "در حال بایگانی…"
                      : `Archive${activeSelectedCount < selection.selectedCount ? ` (${activeSelectedCount})` : ""}`}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setIsBulkDeleteConfirmOpen(true)}
                  disabled={isBulkActionPending}
                  className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  حذف
                </button>
              </PermissionGate>
            </BulkActionToolbar>

            <MediaGrid
              media={media}
              isLoading={isLoading}
              error={error}
              archivingId={archivingId}
              isSelected={selection.isSelected}
              isAllSelected={selection.isAllSelected}
              isSelectionIndeterminate={selection.isIndeterminate}
              onToggleSelect={selection.toggle}
              onToggleSelectAll={selection.toggleAll}
              onArchive={handleArchive}
              onDeleteRequest={setPendingDelete}
              onViewUsage={setUsageTarget}
            />
          </div>
        </Section>

        {isUploadOpen ? (
          <MediaUploadDialog
            onCancel={() => setIsUploadOpen(false)}
            onUploaded={handleUploaded}
          />
        ) : null}

        {pendingDelete ? (
          <MediaDeleteConfirm
            media={pendingDelete}
            onCancel={() => setPendingDelete(null)}
            onDeleted={handleDeleted}
          />
        ) : null}

        {usageTarget ? (
          <MediaUsageDialog media={usageTarget} onClose={() => setUsageTarget(null)} />
        ) : null}

        {isBulkDeleteConfirmOpen ? (
          <BulkDeleteConfirm
            count={selection.selectedCount}
            itemLabel="media asset"
            isDeleting={isBulkActionPending}
            error={bulkDeleteError}
            onCancel={() => {
              setIsBulkDeleteConfirmOpen(false);
              setBulkDeleteError(null);
            }}
            onConfirm={() => void handleConfirmBulkDelete()}
          />
        ) : null}
      </PermissionGate>
    </PageContainer>
  );
}
