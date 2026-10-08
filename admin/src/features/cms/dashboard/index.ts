/**
 * Public surface of the `cms/dashboard` feature.
 *
 * Other layers (pages) should import from here rather than reaching
 * into `./DashboardPage`, `./hooks/useDashboardStats`, etc. directly —
 * same convention as `features/cms/faq/index.ts`.
 */
export { DashboardPage } from "./DashboardPage";
export { DashboardKpiCard, type DashboardKpiCardProps } from "./DashboardKpiCard";
export { DashboardQuickActions } from "./DashboardQuickActions";
export { DashboardRecentActivity } from "./DashboardRecentActivity";
export {
  DashboardPreRegistrationWidget,
  type DashboardPreRegistrationWidgetProps,
} from "./DashboardPreRegistrationWidget";
export {
  useDashboardStats,
  type DashboardStats,
  type UseDashboardStatsResult,
} from "./hooks/useDashboardStats";
