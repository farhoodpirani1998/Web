/**
 * The Publish/Archive/Delete button set for a `BulkActionToolbar`
 * (CMS Bulk Actions sprint, Part 2). Lives here rather than in a
 * single module's folder because it's used by exactly the three
 * modules that share the same publish workflow — News, Pages,
 * Testimonials — all of which alias their status type to the shared
 * `CmsPublishStatus`; see this folder's README for the "used by 2+ CMS
 * modules" rule.
 *
 * Eligibility mirrors each module's own `*StatusControl` — the same
 * `VALID_TRANSITIONS` table (`draft` → `published`/`archived`,
 * `published` → `archived`/`draft`, `archived` → `draft` only) — so
 * this never offers a transition the backend would reject:
 *
 *   - Publish only ever targets currently-`draft` items (the only
 *     status that can transition to `published`; already-`published`
 *     items are a no-op and `archived` can't go straight to
 *     `published`).
 *   - Archive targets anything not already `archived` (`draft` and
 *     `published` can both transition there).
 *   - Delete has no status precondition — it applies to the whole
 *     selection.
 *
 * A button is hidden entirely (not just disabled) when nothing in the
 * current selection is eligible, same as a `*StatusControl` row only
 * rendering the transitions valid for that one item's status. If the
 * eligible count is less than the full selection, the label shows the
 * smaller count so it's clear the action won't touch every checked row.
 *
 * This component only decides *what's eligible* and reports clicks
 * upward — it doesn't call any API itself. `onPublish`/`onArchive`
 * open a status-update loop and `onDeleteRequest` opens a confirm
 * dialog (`BulkDeleteConfirm`); both live on the page component, which
 * is the layer that already owns the list state, `useRowSelection`,
 * and its own `updateXStatus`/`deleteX` API calls.
 */
import { PermissionGate } from "@/components/ui/PermissionGate";
import type { CmsPublishStatus } from "@/features/cms/types";

export interface BulkPublishArchiveDeleteActionsProps {
  /** Current `status` of every currently-selected item. */
  selectedStatuses: CmsPublishStatus[];
  /** True while a bulk publish/archive/delete request is in flight — disables all three buttons. */
  isProcessing: boolean;
  onPublish: () => void;
  onArchive: () => void;
  onDeleteRequest: () => void;
}

export function BulkPublishArchiveDeleteActions({
  selectedStatuses,
  isProcessing,
  onPublish,
  onArchive,
  onDeleteRequest,
}: BulkPublishArchiveDeleteActionsProps) {
  const publishableCount = selectedStatuses.filter((status) => status === "draft").length;
  const archivableCount = selectedStatuses.filter((status) => status !== "archived").length;
  const totalCount = selectedStatuses.length;

  return (
    <>
      <PermissionGate permission="website.content:publish">
        {publishableCount > 0 ? (
          <button
            type="button"
            onClick={onPublish}
            disabled={isProcessing}
            className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isProcessing
              ? "Publishing…"
              : `Publish${publishableCount < totalCount ? ` (${publishableCount})` : ""}`}
          </button>
        ) : null}

        {archivableCount > 0 ? (
          <button
            type="button"
            onClick={onArchive}
            disabled={isProcessing}
            className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isProcessing
              ? "Archiving…"
              : `Archive${archivableCount < totalCount ? ` (${archivableCount})` : ""}`}
          </button>
        ) : null}
      </PermissionGate>

      <PermissionGate permission="website.content:write">
        <button
          type="button"
          onClick={onDeleteRequest}
          disabled={isProcessing}
          className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Delete
        </button>
      </PermissionGate>
    </>
  );
}
