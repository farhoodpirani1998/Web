import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiError } from "@/lib/apiError";

import { FaqRow } from "./FaqRow";
import type { CmsFaq, CmsFaqStatus } from "./types";

/**
 * Renders `useFaqs`'s result — `FaqPage` owns the hook (and the status
 * filter driving it); this component only knows how to display
 * whatever list/loading/error state it's handed, same split as
 * `features/cms/media/MediaGrid.tsx`.
 *
 * Reordering is only enabled when `status` is `undefined` ("All"):
 * `PATCH /faqs/reorder` (`OrderingService.reorder`) writes `position`
 * for exactly the ids it's given, in that order — it does not shift
 * the ids left out. Sending a filtered subset would silently corrupt
 * the position of every FAQ not currently shown, so the drag handle
 * and move buttons only appear over the complete, unfiltered list.
 */
export interface FaqListProps {
  faqs: CmsFaq[];
  isLoading: boolean;
  error: ApiError | null;
  status: CmsFaqStatus | undefined;
  updatingStatusId: string | null;
  isReordering: boolean;
  onEdit: (faq: CmsFaq) => void;
  onDeleteRequest: (faq: CmsFaq) => void;
  onChangeStatus: (faq: CmsFaq, status: CmsFaqStatus) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function FaqList({
  faqs,
  isLoading,
  error,
  status,
  updatingStatusId,
  isReordering,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onReorder,
}: FaqListProps) {
  if (isLoading) {
    return <p className="py-8 text-center text-sm text-slate-500">Loading FAQs…</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  }

  if (faqs.length === 0) {
    return (
      <EmptyState
        title={status ? `No ${status} FAQs` : "No FAQs yet"}
        description="Add a question and answer to get started."
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
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              Question
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              Category
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
          {faqs.map((faq, index) => (
            <FaqRow
              key={faq.id}
              faq={faq}
              index={index}
              rowCount={faqs.length}
              canReorder={canReorder}
              isReordering={isReordering}
              isUpdatingStatus={updatingStatusId === faq.id}
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
