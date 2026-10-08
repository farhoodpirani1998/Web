/**
 * Public surface of the `cms/statistics` feature.
 *
 * Other layers (pages, other CMS modules) should import from here
 * rather than reaching into `./api`, `./hooks/useStatistics`, etc.
 * directly — same convention as `features/cms/features/index.ts`.
 */
export type {
  CmsStatistic,
  CmsStatisticStatus,
  CreateStatisticPayload,
  UpdateStatisticPayload,
} from "./types";
export {
  fetchStatisticList,
  fetchStatisticById,
  createStatistic,
  updateStatistic,
  deleteStatistic,
  updateStatisticStatus,
  reorderStatistics,
} from "./api";
export { useStatistics, type UseStatisticsResult } from "./hooks/useStatistics";

export { StatisticsPage } from "./StatisticsPage";
export { StatisticList, type StatisticListProps } from "./StatisticList";
export { StatisticRow, type StatisticRowProps } from "./StatisticRow";
export { StatisticForm, type StatisticFormProps } from "./StatisticForm";
export {
  StatisticStatusControl,
  type StatisticStatusControlProps,
} from "./StatisticStatusControl";
export {
  StatisticStatusFilter,
  type StatisticStatusFilterProps,
} from "./StatisticStatusFilter";
export {
  StatisticDeleteConfirm,
  type StatisticDeleteConfirmProps,
} from "./StatisticDeleteConfirm";
