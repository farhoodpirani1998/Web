import { EmptyState } from "@/components/ui/EmptyState";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { SelectAllCheckbox } from "@/components/ui/SelectAllCheckbox";
import type { ApiError } from "@/lib/apiError";

import { TestimonialRow } from "./TestimonialRow";
import type { CmsTestimonial, CmsTestimonialStatus } from "./types";

/**
 * Renders `useTestimonials`'s result — `TestimonialsPage` owns the
 * hook (and the status filter driving it); this component only knows
 * how to display whatever list/loading/error state it's handed, same
 * split as `features/cms/faq/FaqList.tsx`.
 *
 * Reordering is only enabled when `status` is `undefined` ("All"):
 * `PATCH /testimonials/reorder` (`OrderingService.reorder`) writes
 * `position` for exactly the ids it's given, in that order — it does
 * not shift the ids left out. Sending a filtered subset would silently
 * corrupt the position of every testimonial not currently shown, so
 * the drag handle and move buttons only appear over the complete,
 * unfiltered list.
 */
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
  onReorder,
}: TestimonialListProps) {
  if (isLoading) {
    return <p className="py-8 text-center text-sm text-slate-500">Loading testimonials…</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  }

  if (testimonials.length === 0) {
    return (
      <EmptyState
        title={status ? `No ${status} testimonials` : "No testimonials yet"}
        description="Add a quote from a parent, student, or staff member to get started."
      />
    );
  }

  const canReorder = status === undefined;

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="w-10 px-3 py-2 text-left font-medium text-slate-500">
              <PermissionGate permission="website.content:write">
                <SelectAllCheckbox
                  checked={isAllSelected}
                  indeterminate={isSelectionIndeterminate}
                  onChange={onToggleSelectAll}
                  aria-label="Select all testimonials"
                />
              </PermissionGate>
            </th>
            {canReorder ? (
              <th scope="col" className="w-10 px-3 py-2 text-left font-medium text-slate-500">
                <span className="sr-only">Reorder</span>
              </th>
            ) : null}
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              Author
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              Quote
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              Rating
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
              onReorder={onReorder}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
