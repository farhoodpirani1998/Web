import { useEffect, useState } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ApiError } from "@/lib/apiError";
import { formatDateTime, formatRelativeTime } from "@/lib/formatDate";

import { describeEntry, fetchRecentActivity } from "@/features/cms/audit-log";
import type { CmsAuditLogEntry } from "@/features/cms/audit-log";

/**
 * Recent Activity — a timeline feed backed by `GET /admin/audit-log`
 * (`features/cms/audit-log/api.ts`), populated by the backend's
 * `AuditLogListener`. Fetches once per Dashboard visit (no polling), same
 * as the KPI cards.
 *
 * `describeEntry` (the `action` → Persian-sentence mapping) lives in the
 * `audit-log` feature so this strip and the fuller Audit Log page share
 * one implementation. No author is shown: today's events carry none.
 */

export function DashboardRecentActivity() {
  const [entries, setEntries] = useState<CmsAuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchRecentActivity()
      .then((list) => {
        if (!cancelled) setEntries(list);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <ul className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <li key={index} className="flex items-center gap-3">
            <Skeleton shape="circle" className="h-8 w-8" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-24" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {error}
      </p>
    );
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        title="فعالیتی ثبت نشده"
        description="کارهایی مانند انتشار، بارگذاری رسانه یا تغییر تنظیمات اینجا نمایش داده می‌شوند."
      />
    );
  }

  return (
    <ol className="relative flex flex-col">
      {entries.map((entry, index) => (
        <li key={entry.id} className="relative flex gap-4 pb-5 last:pb-0">
          {/* Timeline rail: dot + connector, omitted under the last row. */}
          <div className="relative flex flex-col items-center">
            <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-gold ring-4 ring-brand-gold/15" />
            {index < entries.length - 1 ? (
              <span className="mt-1 w-px flex-1 bg-border" aria-hidden="true" />
            ) : null}
          </div>

          <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <p className="text-sm text-foreground">{describeEntry(entry)}</p>
            <time
              dateTime={entry.createdAt}
              title={formatDateTime(entry.createdAt)}
              className="shrink-0 text-xs text-muted-foreground"
            >
              {formatRelativeTime(entry.createdAt)}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}
