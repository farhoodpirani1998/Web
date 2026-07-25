import { Link } from "react-router-dom";

import { ROUTE_PATHS } from "@/routes/paths";

/**
 * Pre-Registration widget — a dedicated callout for the "new"-status
 * count and a direct link to `/admin/pre-registrations`, distinct from
 * that same count's KPI card above. The KPI card and this widget both
 * read from the same `useDashboardStats` result (`newPreRegistrationsCount`)
 * rather than each fetching it separately.
 */
export interface DashboardPreRegistrationWidgetProps {
  count: number | null;
  isLoading: boolean;
}

export function DashboardPreRegistrationWidget({
  count,
  isLoading,
}: DashboardPreRegistrationWidgetProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-600">New pre-registrations</p>
        <p className="text-2xl font-semibold text-slate-900">
          {isLoading ? (
            <span className="text-base font-normal text-slate-400">Loading…</span>
          ) : (
            (count ?? "—")
          )}
        </p>
      </div>

      <Link
        to={ROUTE_PATHS.ADMIN_PRE_REGISTRATIONS}
        className="shrink-0 rounded-md bg-slate-900 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-slate-800"
      >
        View pre-registrations
      </Link>
    </div>
  );
}
