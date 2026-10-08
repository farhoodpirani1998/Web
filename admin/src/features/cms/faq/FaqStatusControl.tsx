import { PermissionGate } from "@/components/ui/PermissionGate";

import type { CmsFaqStatus } from "./types";

/**
 * Mirrors the backend's `VALID_TRANSITIONS`
 * (`core/publishing/publish-status.enum.ts`) so this control only ever
 * offers a transition the backend will actually accept. This is a UI
 * convenience only — `PublishingService.transition` (called from
 * `FaqService.updateStatus`) is the real enforcement; showing an
 * invalid button here would just fail server-side, not corrupt data.
 */
const VALID_TRANSITIONS: Record<CmsFaqStatus, CmsFaqStatus[]> = {
  draft: ["published", "archived"],
  published: ["archived", "draft"],
  archived: ["draft"],
};

const STATUS_LABEL: Record<CmsFaqStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

const STATUS_BADGE_CLASS: Record<CmsFaqStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  published: "bg-emerald-50 text-emerald-700",
  archived: "bg-amber-50 text-amber-700",
};

export interface FaqStatusControlProps {
  status: CmsFaqStatus;
  isUpdating: boolean;
  onChangeStatus: (status: CmsFaqStatus) => void;
}

export function FaqStatusControl({ status, isUpdating, onChangeStatus }: FaqStatusControlProps) {
  const nextOptions = VALID_TRANSITIONS[status];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[status]}`}>
        {STATUS_LABEL[status]}
      </span>

      <PermissionGate permission="website.content:publish">
        {nextOptions.map((next) => (
          <button
            key={next}
            type="button"
            disabled={isUpdating}
            onClick={() => onChangeStatus(next)}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUpdating ? "…" : `Move to ${STATUS_LABEL[next]}`}
          </button>
        ))}
      </PermissionGate>
    </div>
  );
}
