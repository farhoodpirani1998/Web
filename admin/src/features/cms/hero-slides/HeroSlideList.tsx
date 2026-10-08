import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiError } from "@/lib/apiError";

import { HeroSlideRow } from "./HeroSlideRow";
import type { CmsHeroSlide, CmsHeroSlideStatus } from "./types";

/**
 * Renders `useHeroSlides`'s result — `HeroSlidesPage` owns the hook
 * (and the status filter driving it); this component only knows how to
 * display whatever list/loading/error state it's handed, same split
 * as `features/cms/faq/FaqList.tsx`.
 *
 * Reordering is only enabled when `status` is `undefined` ("All"):
 * `PATCH /hero-slides/reorder` (`OrderingService.reorder`) writes
 * `position` for exactly the ids it's given, in that order — it does
 * not shift the ids left out. Sending a filtered subset would silently
 * corrupt the position of every slide not currently shown, so the drag
 * handle and move buttons only appear over the complete, unfiltered
 * list.
 */
export interface HeroSlideListProps {
  slides: CmsHeroSlide[];
  isLoading: boolean;
  error: ApiError | null;
  status: CmsHeroSlideStatus | undefined;
  updatingStatusId: string | null;
  isReordering: boolean;
  onEdit: (slide: CmsHeroSlide) => void;
  onDeleteRequest: (slide: CmsHeroSlide) => void;
  onChangeStatus: (slide: CmsHeroSlide, status: CmsHeroSlideStatus) => void;
  onViewHistory: (slide: CmsHeroSlide) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function HeroSlideList({
  slides,
  isLoading,
  error,
  status,
  updatingStatusId,
  isReordering,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onViewHistory,
  onReorder,
}: HeroSlideListProps) {
  if (isLoading) {
    return <p className="py-8 text-center text-sm text-slate-500">Loading hero slides…</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  }

  if (slides.length === 0) {
    return (
      <EmptyState
        title="No hero slides yet"
        description="Add a slide to get started."
      />
    );
  }

  const canReorder = status === undefined;

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {canReorder ? (
              <th scope="col" className="w-10 px-3 py-2 text-left font-medium text-slate-500">
                <span className="sr-only">Reorder</span>
              </th>
            ) : null}
            <th scope="col" className="w-16 px-3 py-2 text-left font-medium text-slate-500">
              <span className="sr-only">Image</span>
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              Heading
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              CTA
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              Status
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium text-slate-500">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {slides.map((slide, index) => (
            <HeroSlideRow
              key={slide.id}
              slide={slide}
              index={index}
              rowCount={slides.length}
              canReorder={canReorder}
              isReordering={isReordering}
              isUpdatingStatus={updatingStatusId === slide.id}
              onEdit={onEdit}
              onDeleteRequest={onDeleteRequest}
              onChangeStatus={onChangeStatus}
              onViewHistory={onViewHistory}
              onReorder={onReorder}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
