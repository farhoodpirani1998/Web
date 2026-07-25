import { useState } from "react";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";
import { ApiError } from "@/lib/apiError";

import { reorderGalleryItems, updateGalleryItemStatus } from "./api";
import { GalleryDeleteConfirm } from "./GalleryDeleteConfirm";
import { GalleryGrid } from "./GalleryGrid";
import { GalleryItemForm } from "./GalleryItemForm";
import { GalleryStatusFilter } from "./GalleryStatusFilter";
import { useGallery } from "./hooks/useGallery";
import type { CmsGalleryItem, CmsGalleryStatus } from "./types";

/**
 * The Gallery admin page (`/admin/gallery`, wired via
 * `pages/GalleryPage.tsx` — same "feature-owned UI, page file just
 * re-exports it" convention `pages/FaqPage.tsx` established).
 *
 * Gated behind `website.content:read` for the entire page body,
 * matching `GalleryController`'s own `@RequireCmsPermission(CONTENT_READ)`
 * on every GET — a user without it can't view the gallery at all, not
 * just edit it. Write/publish actions are gated again at the control
 * level (`GalleryItemCard`, `GalleryStatusControl`), same layered-gating
 * approach `FaqPage`/`FaqRow` use.
 *
 * Owns the state that ties the child components together: the status
 * filter (fed into `useGallery`), which dialog (if any) is open, which
 * item is mid-status-change, and whether a reorder is in flight.
 */
export function GalleryPage() {
  const [status, setStatus] = useState<CmsGalleryStatus | undefined>(undefined);
  const { items, isLoading, error, refetch, setItems } = useGallery(status);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CmsGalleryItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CmsGalleryItem | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  function handleCreate() {
    setEditingItem(null);
    setIsFormOpen(true);
  }

  function handleEdit(item: CmsGalleryItem) {
    setEditingItem(item);
    setIsFormOpen(true);
  }

  function handleSaved() {
    setIsFormOpen(false);
    setEditingItem(null);
    refetch();
  }

  function handleDeleted() {
    setPendingDelete(null);
    refetch();
  }

  async function handleChangeStatus(item: CmsGalleryItem, nextStatus: CmsGalleryStatus) {
    setActionError(null);
    setUpdatingStatusId(item.id);

    try {
      const updated = await updateGalleryItemStatus(item.id, nextStatus);
      setItems((current) => current.map((row) => (row.id === updated.id ? updated : row)));
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleReorder(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= items.length) return;

    const reordered = [...items];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    // Optimistic: update the visible order immediately and roll back on
    // failure. `PATCH /gallery/reorder` returns void
    // (`GalleryService.reorder`), so there's no response body to
    // reconcile against — only whether the call succeeded.
    const previous = items;
    setItems(reordered);
    setActionError(null);
    setIsReordering(true);

    try {
      await reorderGalleryItems(reordered.map((row) => row.id));
    } catch (err) {
      setItems(previous);
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setIsReordering(false);
    }
  }

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "Dashboard" }, { label: "Gallery" }]} />

      <PermissionGate
        permission="website.content:read"
        fallback={
          <>
            <PageHeader title="Gallery" />
            <Section>
              <EmptyState
                title="You don't have access to the gallery"
                description="Viewing the gallery requires the Content permission. Contact an admin if you need access."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="Gallery"
          description="Manage the photos shown in the public gallery."
        >
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={handleCreate}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              New gallery item
            </button>
          </PermissionGate>
        </PageHeader>

        <Section>
          <div className="flex flex-col gap-4">
            <GalleryStatusFilter value={status} onChange={setStatus} />

            {actionError ? (
              <p role="alert" className="text-sm text-red-600">
                {actionError}
              </p>
            ) : null}

            <GalleryGrid
              items={items}
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
          <GalleryItemForm
            item={editingItem}
            onCancel={() => setIsFormOpen(false)}
            onSaved={handleSaved}
          />
        ) : null}

        {pendingDelete ? (
          <GalleryDeleteConfirm
            item={pendingDelete}
            onCancel={() => setPendingDelete(null)}
            onDeleted={handleDeleted}
          />
        ) : null}
      </PermissionGate>
    </PageContainer>
  );
}
