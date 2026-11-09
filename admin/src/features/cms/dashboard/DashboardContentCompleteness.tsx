import {
  AlertCircle,
  CheckCircle2,
  Circle,
  LoaderCircle,
  RefreshCw,
  ShieldQuestion,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { formatNumber } from "@/lib/formatNumber";

import { useDashboardCompleteness } from "./hooks/useDashboardCompleteness";
import type { CompletenessStatus } from "./hooks/useDashboardCompleteness";

const STATUS_TEXT: Record<CompletenessStatus, string> = {
  loading: "در حال بررسی",
  complete: "تکمیل",
  incomplete: "نیازمند محتوا",
  error: "دریافت ناموفق",
  unsupported: "قابل بررسی نیست",
};

function StatusIcon({ status }: { status: CompletenessStatus }) {
  if (status === "loading")
    return <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />;
  if (status === "complete")
    return <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />;
  if (status === "error")
    return <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />;
  if (status === "unsupported")
    return (
      <ShieldQuestion className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
    );
  return <Circle className="h-4 w-4 text-amber-600" aria-hidden="true" />;
}

export function DashboardContentCompleteness() {
  const { items, isLoading, errorCount, refetch } = useDashboardCompleteness();
  const scoredItems = items.filter((item) => item.status !== "unsupported");
  const completedCount = scoredItems.filter((item) => item.status === "complete").length;
  const percentage = scoredItems.length
    ? Math.round((completedCount / scoredItems.length) * 100)
    : 0;

  return (
    <Card className="rounded-2xl border-brand-gold/20">
      <CardHeader className="px-5 pb-3 pt-5">
        <CardTitle className="text-base">تکمیل محتوای سایت</CardTitle>
        <CardDescription>وضعیت محتوا بر اساس داده‌های منتشرشده در پنل</CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="mb-3 flex items-end justify-between gap-3">
          <p className="font-heading text-3xl font-extrabold tabular-nums text-foreground">
            {isLoading ? "…" : `${formatNumber(percentage)}٪`}
          </p>
          <span className="text-xs text-muted-foreground">
            {isLoading
              ? "در حال بررسی بخش‌ها"
              : `${formatNumber(completedCount)} از ${formatNumber(scoredItems.length)} مورد`}
          </span>
        </div>
        <div
          className="h-3 overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-label="درصد تکمیل محتوای سایت"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={isLoading ? 0 : percentage}
        >
          <div
            className="h-full rounded-full bg-gradient-to-l from-brand-gold to-amber-400 transition-[width]"
            style={{ width: `${isLoading ? 0 : percentage}%` }}
          />
        </div>

        {errorCount > 0 ? (
          <div
            role="alert"
            className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            <span>
              دریافت اطلاعات {formatNumber(errorCount)} بخش ناموفق بود؛ نتیجه را دوباره
              بررسی کنید.
            </span>
            <button
              type="button"
              onClick={refetch}
              className="inline-flex items-center gap-1 font-semibold underline underline-offset-2"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              تلاش دوباره
            </button>
          </div>
        ) : null}

        <ul className="mt-4 space-y-1" aria-label="چک‌لیست تکمیل محتوای سایت">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to={item.href}
                className="flex items-start gap-3 rounded-lg px-2 py-2 text-sm transition hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              >
                <span className="mt-0.5 shrink-0">
                  <StatusIcon status={item.status} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-foreground">{item.label}</span>
                  {item.description ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {STATUS_TEXT[item.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          نمادهای اعتماد در محاسبه لحاظ نمی‌شوند چون بخش مدیریت مربوط به آن‌ها در پنل
          موجود نیست.
        </p>
      </CardContent>
    </Card>
  );
}
