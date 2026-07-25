/**
 * A single KPI count card on the Dashboard.
 *
 * Used by exactly one module (Dashboard) today, so it lives here
 * rather than in `features/cms/components/` — per that folder's own
 * README, a component only moves up once a *second* CMS module needs
 * it too. Built on `Section`'s existing card styling (border/rounded/
 * padding) rather than introducing a new visual language, per this
 * sprint's "do not redesign the admin layout" constraint.
 */
export interface DashboardKpiCardProps {
  label: string;
  /** `null` when this count's fetch failed — rendered as "—" rather than 0, so a failed count is never confused with a real zero. */
  value: number | null;
  isLoading: boolean;
}

export function DashboardKpiCard({ label, value, isLoading }: DashboardKpiCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className="text-3xl font-semibold text-slate-900">
        {isLoading ? (
          <span className="text-base font-normal text-slate-400">Loading…</span>
        ) : (
          value ?? "—"
        )}
      </span>
    </div>
  );
}
