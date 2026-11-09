import { Skeleton } from "@/components/ui/Skeleton";
import type { ApiError } from "@/lib/apiError";

import { TestimonialRow } from "./TestimonialRow";
import type { CmsTestimonial, CmsTestimonialStatus } from "./types";

const TESTIMONIAL_SKELETON_KEYS = [
  "testimonial-skeleton-1",
  "testimonial-skeleton-2",
  "testimonial-skeleton-3",
] as const;

export interface TestimonialListProps {
  testimonials: CmsTestimonial[];
  isLoading: boolean;
  error: ApiError | null;
  status: CmsTestimonialStatus | undefined;
  updatingStatusId: string | null;
  isReordering: boolean;
  isSelected: (testimonial: CmsTestimonial) => boolean;
  isAllSelected: boolean;
  isSelectionIndeterminate: boolean;
  onToggleSelect: (testimonial: CmsTestimonial) => void;
  onToggleSelectAll: () => void;
  onEdit: (testimonial: CmsTestimonial) => void;
  onDeleteRequest: (testimonial: CmsTestimonial) => void;
  onChangeStatus: (testimonial: CmsTestimonial, status: CmsTestimonialStatus) => void;
  onToggleFeatured: (testimonial: CmsTestimonial) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function TestimonialList({
  testimonials,
  isLoading,
  error,
  status,
  updatingStatusId,
  isReordering,
  isSelected,
  isAllSelected,
  isSelectionIndeterminate,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onToggleFeatured,
  onReorder,
}: TestimonialListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 py-8">
        {TESTIMONIAL_SKELETON_KEYS.map((key) => (
          <Skeleton key={key} className="h-10 w-full" />
        ))}
      </div>
    );
  }
  if (error) return <p className="py-8 text-center text-sm text-red-600">خطا: {error.message}</p>;

  const canReorder = status === undefined;

  return (
    <div dir="rtl" className="overflow-x-auto rounded-md border border-slate-200">
      <table className="w-full text-right text-sm">
        <caption className="sr-only">فهرست نظرات</caption>
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            <th className="px-3 py-2">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(element) => {
                  if (element) element.indeterminate = isSelectionIndeterminate;
                }}
                onChange={onToggleSelectAll}
                aria-label="انتخاب همه نظرات"
              />
            </th>
            {canReorder ? <th className="px-3 py-2">ترتیب</th> : null}
            <th className="px-3 py-2 font-medium">نویسنده</th>
            <th className="px-3 py-2 font-medium">متن</th>
            <th className="px-3 py-2 font-medium">امتیاز</th>
            <th className="px-3 py-2 font-medium">وضعیت</th>
            <th className="px-3 py-2 font-medium">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {testimonials.map((testimonial, index) => (
            <TestimonialRow
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
              rowCount={testimonials.length}
              canReorder={canReorder}
              isReordering={isReordering}
              isUpdatingStatus={updatingStatusId === testimonial.id}
              selected={isSelected(testimonial)}
              onToggleSelect={onToggleSelect}
              onEdit={onEdit}
              onDeleteRequest={onDeleteRequest}
              onChangeStatus={onChangeStatus}
              onToggleFeatured={onToggleFeatured}
              onReorder={onReorder}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
