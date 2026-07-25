import type { ReactNode } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { PermissionGate } from "@/components/ui/PermissionGate";

import { useMediaList } from "./useMediaList";
import type { CmsMedia } from "./types";

/**
 * Foundation for the media picker every future content module's "select
 * an image" field will use (see the Sprint 3.3 audit, §6 items 1–2).
 *
 * Deliberately just the picker's core content — a permission-gated grid
 * of active media, click-to-select — not a modal/dialog shell. No
 * module needs a modal yet (none call this component today), so
 * wrapping it in one now would be guessing at that module's own
 * layout/trigger needs. A future module wraps `<MediaPicker>` in
 * whatever modal/panel/inline layout its form actually needs.
 *
 * Gated on `website.media:manage`, mirroring every `/admin/media` route
 * on the backend (`MediaController`) — same permission, so this never
 * renders a picker whose selections would fail server-side. Per the
 * audit's flagged (not fixed) gap: `content_editor`/`publisher` don't
 * have this permission today, so this renders its `fallback` for them
 * until that's a product decision someone makes — not something this
 * component works around.
 *
 * Only filters to `status: "active"` — archived media isn't a valid
 * choice for a new reference. No search/pagination controls: `GET
 * /admin/media` doesn't support either (see the audit, §3), and this
 * foundation shouldn't invent a client-side version speculatively.
 */
export interface MediaPickerProps {
  /** Currently selected media id, if any (e.g. editing an existing reference). */
  selectedId?: string | null;
  onSelect: (media: CmsMedia) => void;
  /** Rendered in place of the picker when the current admin lacks `website.media:manage`. */
  fallback?: ReactNode;
}

export function MediaPicker({ selectedId, onSelect, fallback }: MediaPickerProps) {
  return (
    <PermissionGate permission="website.media:manage" fallback={fallback}>
      <MediaPickerGrid selectedId={selectedId} onSelect={onSelect} />
    </PermissionGate>
  );
}

function MediaPickerGrid({
  selectedId,
  onSelect,
}: Pick<MediaPickerProps, "selectedId" | "onSelect">) {
  const { media, isLoading, error } = useMediaList("active");

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading media…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error.message}</p>;
  }

  if (media.length === 0) {
    return (
      <EmptyState
        title="No media yet"
        description="Uploaded images will appear here to select from."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {media.map((item) => {
        const isSelected = item.id === selectedId;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            aria-pressed={isSelected}
            className={`overflow-hidden rounded-lg border text-left transition ${
              isSelected
                ? "border-slate-900 ring-2 ring-slate-900"
                : "border-slate-200 hover:border-slate-400"
            }`}
          >
            <img
              src={item.thumbnailUrl ?? item.url}
              alt={item.altText}
              className="aspect-square w-full object-cover"
            />
          </button>
        );
      })}
    </div>
  );
}
