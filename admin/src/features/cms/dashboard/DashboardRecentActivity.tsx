import { useEffect, useState } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { ApiError } from "@/lib/apiError";

import { fetchRecentActivity } from "@/features/cms/audit-log";
import type { CmsAuditLogEntry } from "@/features/cms/audit-log";

/**
 * Recent Activity section — now backed by `GET /admin/audit-log`
 * (`features/cms/audit-log/api.ts`), populated by the backend's
 * `AuditLogListener` reacting to events every content/media/settings
 * service already emits (see that listener's own comment). No polling:
 * this fetches once per Dashboard visit, same as the KPI cards
 * (`useDashboardStats`) — a manual page refresh is how an admin sees
 * newer activity, consistent with the rest of this page.
 *
 * `action` values are the raw backend strings (`PublishStatus` values
 * like "published"/"draft"/"archived", or "media_uploaded"/
 * "settings_updated") — `describeEntry` below turns them into a short
 * human sentence. No author is shown: today's events carry none (see
 * `AuditLogEntry`'s own doc comment on why).
 */
function describeEntry(entry: CmsAuditLogEntry): string {
  const entityLabel = entry.entityType
    ? entry.entityType.replace(/_/g, " ")
    : null;

  switch (entry.action) {
    case "published":
      return entityLabel ? `${capitalize(entityLabel)} published` : "Content published";
    case "draft":
      return entityLabel ? `${capitalize(entityLabel)} moved to draft` : "Content moved to draft";
    case "archived":
      return entityLabel ? `${capitalize(entityLabel)} archived` : "Content archived";
    case "media_uploaded":
      return "Media uploaded";
    case "settings_updated": {
      const group = entry.metadata?.group;
      return typeof group === "string"
        ? `Site settings updated (${group.replace(/_/g, " ")})`
        : "Site settings updated";
    }
    default:
      return entityLabel ? `${capitalize(entityLabel)} ${entry.action}` : entry.action;
  }
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

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
    return <p className="py-4 text-sm text-slate-500">Loading recent activity…</p>;
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-600">
        {error}
      </p>
    );
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No recent activity"
        description="Actions like publishing, uploading media, or updating settings will show up here."
      />
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-slate-200">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-center justify-between gap-4 py-3">
          <p className="text-sm text-slate-900">{describeEntry(entry)}</p>
          <p className="shrink-0 text-xs text-slate-500">
            {new Date(entry.createdAt).toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  );
}

