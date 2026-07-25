import { EmptyState } from "@/components/ui/EmptyState";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { SelectAllCheckbox } from "@/components/ui/SelectAllCheckbox";
import type { ApiError } from "@/lib/apiError";

import { MediaCard } from "./MediaCard";
import type { CmsMedia } from "./types";

/**
 * Renders `useMediaList`'s result — `MediaPage` owns the hook (and the
 * status filter driving it); this component only knows how to display
 * whatever list/loading/error state it's handed. Kept dumb/presentational
 * so it stays reusable if a second place ever needs a media grid (e.g. a
 * future full `MediaPicker` upgrade) without also inheriting a specific
 * data-fetching setup.
 *
 * Selection state (`isSelected`/`onToggleSelect`/`onToggleSelectAll`) is
 * owned by `MediaPage` via `useRowSelection`, same split
 * `NewsList`/`PageList`/`TestimonialList` use — this component only
 * renders the checkboxes and wires their events. The card grid has no
 * table header to hang a "select all" checkbox on the way those table-
 * based lists do, so it gets its own small bar above the grid instead,
 * reusing the same `SelectAllCheckbox` control.
 */
export interface MediaGridProps {
  media: CmsMedia[];
  isLoading: boolean;
  error: ApiError | null;
  archivingId: string | null;
  isSelected: (media: CmsMedia) => boolean;
  isAllSelected: boolean;
  isSelectionIndeterminate: boolean;
  onToggleSelect: (media: CmsMedia) => void;
  onToggleSelectAll: () => void;
  onArchive: (media: CmsMedia) => void;
  onDeleteRequest: (media: CmsMedia) => void;
  onViewUsage: (media: CmsMedia) => void;
}

export function MediaGrid({
  media,
  isLoading,
  error,
  archivingId,
  isSelected,
  isAllSelected,
  isSelectionIndeterminate,
  onToggleSelect,
  onToggleSelectAll,
  onArchive,
  onDeleteRequest,
  onViewUsage,
}: MediaGridProps) {
  if (isLoading) {
    return <p className="py-8 text-center text-sm text-slate-500">Loading media…</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  }

  if (media.length === 0) {
    return (
      <EmptyState
        title="No media yet"
        description="Upload an image to get started."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <PermissionGate permission="website.media:manage">
        <label className="flex w-fit items-center gap-2 text-sm text-slate-600">
          <SelectAllCheckbox
            checked={isAllSelected}
            indeterminate={isSelectionIndeterminate}
            onChange={onToggleSelectAll}
            aria-label="Select all media"
          />
          Select all
        </label>
      </PermissionGate>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {media.map((item) => (
          <MediaCard
            key={item.id}
            media={item}
            isArchiving={archivingId === item.id}
            selected={isSelected(item)}
            onToggleSelect={onToggleSelect}
            onArchive={onArchive}
            onDeleteRequest={onDeleteRequest}
            onViewUsage={onViewUsage}
          />
        ))}
      </div>
    </div>
  );
}
