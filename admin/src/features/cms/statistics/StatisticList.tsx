import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiError } from "@/lib/apiError";

import { StatisticRow } from "./StatisticRow";
import type { CmsStatistic, CmsStatisticStatus } from "./types";

/**
 * Renders `useStatistics`'s result — `StatisticsPage` owns the hook
 * (and the status filter driving it); this component only knows how to
 * display whatever list/loading/error state it's handed, same split as
 * `features/cms/features/FeatureList.tsx`.
 *
 * Reordering is only enabled when `status` is `undefined` ("All"):
 * `PATCH /statistics/reorder` (`OrderingService.reorder`) writes
 * `position` for exactly the ids it's given, in that order — it does
 * not shift the ids left out. Sending a filtered subset would silently
 * corrupt the position of every Statistic not currently shown, so the
 * drag handle and move buttons only appear over the complete,
 * unfiltered list.
 */
export interface StatisticListProps {
  statistics: CmsStatistic[];
  isLoading: boolean;
  error: ApiError | null;
  status: CmsStatisticStatus | undefined;
  updatingStatusId: string | null;
  isReordering: boolean;
  onEdit: (statistic: CmsStatistic) => void;
  onDeleteRequest: (statistic: CmsStatistic) => void;
  onChangeStatus: (statistic: CmsStatistic, status: CmsStatisticStatus) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function StatisticList({
  statistics,
  isLoading,
  error,
  status,
  updatingStatusId,
  isReordering,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onReorder,
}: StatisticListProps) {
  if (isLoading) {
    return <p className="py-8 text-center text-sm text-slate-500">Loading Statistics…</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  }

  if (statistics.length === 0) {
    return (
      <EmptyState
        title="No statistics yet"
        description="Add a stat counter to get started."
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
              Label
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              Value
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              Icon
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
          {statistics.map((statistic, index) => (
            <StatisticRow
              key={statistic.id}
              statistic={statistic}
              index={index}
              rowCount={statistics.length}
              canReorder={canReorder}
              isReordering={isReordering}
              isUpdatingStatus={updatingStatusId === statistic.id}
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
