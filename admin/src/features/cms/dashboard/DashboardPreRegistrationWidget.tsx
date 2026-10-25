import { ArrowLeft, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ROUTE_PATHS } from "@/routes/paths";

/**
 * Pre-Registration callout — a dedicated gold-accent CTA for the
 * "new"-status count and a direct link to `/admin/pre-registrations`,
 * distinct from that same count's KPI card above. Both read from the same
 * `useDashboardStats` result rather than fetching separately.
 */
export interface DashboardPreRegistrationWidgetProps {
  count: number | null;
  isLoading: boolean;
}

export function DashboardPreRegistrationWidget({
  count,
  isLoading,
}: DashboardPreRegistrationWidgetProps) {
  const hasNew = !isLoading && typeof count === "number" && count > 0;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-brand-gold/30 bg-gradient-to-l from-brand-gold/10 to-transparent p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-gold/20 text-brand-gold">
          <ClipboardList className="h-6 w-6" />
        </span>
        <div>
          <p className="text-sm font-medium text-muted-foreground">پیش‌ثبت‌نام‌های جدید</p>
          <p className="font-heading text-2xl font-extrabold text-foreground">
            {isLoading ? <Skeleton className="mt-1 h-7 w-12" /> : (count ?? "—")}
          </p>
          {hasNew ? (
            <p className="mt-0.5 text-xs text-brand-gold">
              {count === 1 ? "یک درخواست در انتظار بررسی" : `${count} درخواست در انتظار بررسی`}
            </p>
          ) : null}
        </div>
      </div>

      <Button asChild variant="gold" className="shrink-0">
        <Link to={ROUTE_PATHS.ADMIN_PRE_REGISTRATIONS}>
          مشاهده پیش‌ثبت‌نام‌ها
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
