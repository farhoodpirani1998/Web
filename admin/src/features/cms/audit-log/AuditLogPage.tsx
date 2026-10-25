import { useCallback, useState } from "react";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDateTime, formatRelativeTime } from "@/lib/formatDate";

import { describeEntry } from "./describeEntry";
import { useAuditLog } from "./hooks/useAuditLog";
import type { CmsAuditLogEntry } from "./types";

/**
 * The Audit Log admin page (`/admin/audit-log`). A read-only viewer over
 * the same feed the Dashboard's "Recent Activity" strip shows, but with
 * a larger slice and full timestamps. There is no create/edit/delete —
 * rows are written only by `AuditLogListener` (backend), reacting to
 * content/media/settings events.
 *
 * Gated behind `website.content:read`, the exact permission
 * `AuditLogController` requires on the endpoint itself.
 */

/** How many entries to load per step. The server clamps to a max of 500; this is well within it. */
const PAGE_SIZE = 50;
/** Absolute cap — matches the backend's `MAX_RECENT_LIMIT`. */
const MAX_ENTRIES = 500;

export function AuditLogPage() {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const { entries, isLoading, error, refetch } = useAuditLog(limit);

  const handleLoadMore = useCallback(() => {
    setLimit((current) => Math.min(current + PAGE_SIZE, MAX_ENTRIES));
  }, []);

  const handleRefresh = useCallback(() => {
    setLimit(PAGE_SIZE);
    refetch();
  }, [refetch]);

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "داشبورد" }, { label: "گزارش فعالیت‌ها" }]} />

      <PermissionGate
        permission="website.content:read"
        fallback={
          <>
            <PageHeader title="گزارش فعالیت‌ها" />
            <Section>
              <EmptyState
                title="به گزارش فعالیت‌ها دسترسی ندارید"
                description="مشاهده گزارش فعالیت‌ها نیازمند دسترسی محتوا است. در صورت نیاز با مدیر تماس بگیرید."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="گزارش فعالیت‌ها"
          description="تاریخچه اقدامات انجام‌شده در پنل مدیریت (انتشار، بارگذاری رسانه، تغییر تنظیمات و ...)."
        >
          <button
            type="button"
            onClick={handleRefresh}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            به‌روزرسانی
          </button>
        </PageHeader>

        <Section>
          <AuditLogTable
            entries={entries}
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
            canLoadMore={entries.length >= limit && limit < MAX_ENTRIES}
            onLoadMore={handleLoadMore}
          />
        </Section>
      </PermissionGate>
    </PageContainer>
  );
}

function AuditLogTable({
  entries,
  isLoading,
  error,
  onRetry,
  canLoadMore,
  onLoadMore,
}: {
  entries: CmsAuditLogEntry[];
  isLoading: boolean;
  error: { message: string } | null;
  onRetry: () => void;
  canLoadMore: boolean;
  onLoadMore: () => void;
}) {
  if (isLoading) {
    return (
      <ul className="flex flex-col gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <li key={index} className="flex items-center gap-3">
            <Skeleton shape="circle" className="h-8 w-8" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-24" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <p role="alert" className="text-sm text-red-600">
          {error.message}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          تلاش مجدد
        </button>
      </div>
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
      {canLoadMore ? (
        <li className="pt-3 text-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoading}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "در حال بارگذاری…" : "موارد بیشتر"}
          </button>
        </li>
      ) : entries.length >= MAX_ENTRIES ? (
        <li className="pt-3 text-center text-xs text-muted-foreground">
          تنها {MAX_ENTRIES} مورد آخر قابل مشاهده است.
        </li>
      ) : null}
    </ol>
  );
}
