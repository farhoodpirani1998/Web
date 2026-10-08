import { EmptyState } from "@/components/ui/EmptyState";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { SelectAllCheckbox } from "@/components/ui/SelectAllCheckbox";
import type { ApiError } from "@/lib/apiError";

import { PageRow } from "./PageRow";
import type { CmsPage, CmsPageStatus } from "./types";

/**
 * Renders `usePages`'s result — `PagesPage` owns the hook (and the
 * status/parent filters driving it); this component only knows how to
 * display whatever list/loading/error state it's handed, same split
 * as `features/cms/news/NewsList.tsx`.
 *
 * `parentTitle` for each row is resolved from `pages` itself (a lookup
 * by `parentId` within the currently-loaded list) rather than a
 * separate fetch per row — good enough for admin display purposes;
 * if the parent isn't in the current filtered view (e.g. it has a
 * different status than the active filter), the row just shows no
 * parent label rather than issuing an extra request for it.
 *
 * No reorder controls: same reasoning as `NewsList`.
 */
export interface PageListProps {
  pages: CmsPage[];
  isLoading: boolean;
  error: ApiError | null;
  status: CmsPageStatus | undefined;
  updatingStatusId: string | null;
  updatingScheduleId: string | null;
  updatingHomepageId: string | null;
  isSelected: (page: CmsPage) => boolean;
  isAllSelected: boolean;
  isSelectionIndeterminate: boolean;
  onToggleSelect: (page: CmsPage) => void;
  onToggleSelectAll: () => void;
  onEdit: (page: CmsPage) => void;
  onDeleteRequest: (page: CmsPage) => void;
  onChangeStatus: (page: CmsPage, status: CmsPageStatus) => void;
  onSchedule: (page: CmsPage, publishAt: string | null) => void;
  onSetHomepage: (page: CmsPage, isHomepage: boolean) => void;
  onViewHistory: (page: CmsPage) => void;
}

export function PageList({
  pages,
  isLoading,
  error,
  status,
  updatingStatusId,
  updatingScheduleId,
  updatingHomepageId,
  isSelected,
  isAllSelected,
  isSelectionIndeterminate,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onSchedule,
  onSetHomepage,
  onViewHistory,
}: PageListProps) {
  if (isLoading) {
    return <p className="py-8 text-center text-sm text-slate-500">Loading pages…</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  }

  if (pages.length === 0) {
    return (
      <EmptyState
        title={status ? `No ${status} pages` : "No pages yet"}
        description="Add a page to get started."
      />
    );
  }

  const titleById = new Map(pages.map((page) => [page.id, page.title.fa]));

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
                  aria-label="Select all pages"
                />
              </PermissionGate>
            </th>
            <th scope="col" className="w-16 px-3 py-2 text-left font-medium text-slate-500">
              <span className="sr-only">Image</span>
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              Title
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              Template
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              Status
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              Publish at
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              Homepage
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium text-slate-500">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {pages.map((page) => (
            <PageRow
              key={page.id}
              page={page}
              parentTitle={page.parentId ? titleById.get(page.parentId) : undefined}
              isUpdatingStatus={updatingStatusId === page.id}
              isUpdatingSchedule={updatingScheduleId === page.id}
              isUpdatingHomepage={updatingHomepageId === page.id}
              selected={isSelected(page)}
              onToggleSelect={onToggleSelect}
              onEdit={onEdit}
              onDeleteRequest={onDeleteRequest}
              onChangeStatus={onChangeStatus}
              onSchedule={onSchedule}
              onSetHomepage={onSetHomepage}
              onViewHistory={onViewHistory}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
