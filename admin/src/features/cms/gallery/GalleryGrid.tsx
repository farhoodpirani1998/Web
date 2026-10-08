import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiError } from "@/lib/apiError";

import { GalleryItemCard } from "./GalleryItemCard";
import type { CmsGalleryItem, CmsGalleryStatus } from "./types";

/**
 * Renders `useGallery`'s result — `GalleryPage` owns the hook (and the
 * status filter driving it); this component only knows how to display
 * whatever list/loading/error state it's handed, same split as
 * `features/cms/faq/FaqList.tsx`.
 *
 * Reordering is only enabled when `status` is `undefined` ("All"):
 * `PATCH /gallery/reorder` (`OrderingService.reorder`) writes `position`
 * for exactly the ids it's given, in that order — it does not shift
 * the ids left out. Sending a filtered subset would silently corrupt
 * the position of every item not currently shown, so the drag handle
 * and move buttons only appear over the complete, unfiltered list.
 *
 * A grid (not a table, like `FaqList`) — gallery items are photos, and
 * a photo grid is the natural layout for browsing/reordering them.
 */
export interface GalleryGridProps {
  items: CmsGalleryItem[];
  isLoading: boolean;
  error: ApiError | null;
  status: CmsGalleryStatus | undefined;
  updatingStatusId: string | null;
  isReordering: boolean;
  onEdit: (item: CmsGalleryItem) => void;
  onDeleteRequest: (item: CmsGalleryItem) => void;
  onChangeStatus: (item: CmsGalleryItem, status: CmsGalleryStatus) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function GalleryGrid({
  items,
  isLoading,
  error,
  status,
  updatingStatusId,
  isReordering,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onReorder,
}: GalleryGridProps) {
  if (isLoading) {
    return <p className="py-8 text-center text-sm text-slate-500">Loading gallery…</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No gallery items yet"
        description="Add a photo to get started."
      />
    );
  }

  const canReorder = status === undefined;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <GalleryItemCard
          key={item.id}
          item={item}
          index={index}
          itemCount={items.length}
          canReorder={canReorder}
          isReordering={isReordering}
          isUpdatingStatus={updatingStatusId === item.id}
          onEdit={onEdit}
          onDeleteRequest={onDeleteRequest}
          onChangeStatus={onChangeStatus}
          onReorder={onReorder}
        />
      ))}
    </div>
  );
}
