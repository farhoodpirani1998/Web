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
import { evictCachedMedia } from "./mediaCache";
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
 * Media Library UX v2, Part 2A scope: also owns selection state via
 * `useRowSelection`, same hook `NewsPage`/`PageList`/`TestimonialsPage`
 * already use for their bulk-selection UI.
 *
 * Part 2B adds the one bulk action Media has: delete. There's no bulk
 * publish/archive here (unlike `NewsPage`/`TestimonialsPage`'s
 * `BulkPublishArchiveDeleteActions`) — Media has no `CmsPublishStatus`
 * lifecycle, just `active`/`archived`, and archiving is already a
 * per-item action. So `BulkActionToolbar`'s `children` slot just gets a
 * plain Delete button instead of that shared component.
 *
 * `handleConfirmBulkDelete` mirrors `NewsPage`/`TestimonialsPage`'s own
 * bulk-delete handler: fire `deleteMedia` for every selected item in
 * parallel via `Promise.allSettled` (there's no bulk-delete endpoint,
 * just N calls to the existing single-item one), evict each success
 * from `mediaCache` (same as `MediaDeleteConfirm`), drop succeeded ids
 * from the selection (`deselectIds` — this is "clear selection after
 * success"; for a full success that empties the selection entirely),
 * and `refetch()` so the grid reflects the deletions. A partial
 * failure (e.g. some assets are still referenced elsewhere and 409 —
 * see `MediaDeleteConfirm`'s `isConflict` for the single-item version
 * of that) leaves the failed items checked and reports the count via
 * `bulkDeleteError`, same as the other modules; unlike the single-item
 * dialog this doesn't distinguish a 409 from any other failure, since
 * `BulkDeleteConfirm` only has one error slot.
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
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);

  async function handleArchive(item: CmsMedia) {
    setArchiveError(null);
    setArchivingId(item.id);
    try {
      await archiveMedia(item.id);
      refetch();
    } catch (err) {
      setArchiveError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
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
      <Breadcrumb items={[{ label: "Dashboard" }, { label: "Media" }]} />

      <PermissionGate
        permission="website.media:manage"
        fallback={
          <>
            <PageHeader title="Media" />
            <Section>
              <EmptyState
                title="You don't have access to Media"
                description="Managing media requires the Media permission. Contact an admin if you need access."
              />
            </Section>
          </>
        }
      >
        <PageHeader title="Media" description="Upload and manage images used across the site.">
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Upload media
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

            <BulkActionToolbar selectedCount={selection.selectedCount} onClear={selection.clear}>
              <PermissionGate permission="website.media:manage">
                <button
                  type="button"
                  onClick={() => setIsBulkDeleteConfirmOpen(true)}
                  disabled={isBulkDeleting}
                  className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Delete
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
          <MediaUploadDialog onCancel={() => setIsUploadOpen(false)} onUploaded={handleUploaded} />
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
            isDeleting={isBulkDeleting}
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
