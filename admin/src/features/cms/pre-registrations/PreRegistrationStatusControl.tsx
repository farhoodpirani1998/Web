import { PermissionGate } from "@/components/ui/PermissionGate";

import type { CmsPreRegistrationStatus } from "./types";

/**
 * Unlike `FaqStatusControl`, there's no `VALID_TRANSITIONS` map here:
 * `PreRegistrationsService.updateStatus` (backend) assigns and saves
 * the given status directly, with no transition validation — this is
 * plain triage state, not a governed publish workflow (see the entity
 * and controller's own doc comments). So every status other than the
 * current one is always offered.
 */
const STATUS_LABEL: Record<CmsPreRegistrationStatus, string> = {
  new: "New",
  contacted: "Contacted",
  archived: "Archived",
};

const STATUS_BADGE_CLASS: Record<CmsPreRegistrationStatus, string> = {
  new: "bg-sky-50 text-sky-700",
  contacted: "bg-emerald-50 text-emerald-700",
  archived: "bg-slate-100 text-slate-600",
};

const ALL_STATUSES: CmsPreRegistrationStatus[] = ["new", "contacted", "archived"];

export interface PreRegistrationStatusControlProps {
  status: CmsPreRegistrationStatus;
  isUpdating: boolean;
  onChangeStatus: (status: CmsPreRegistrationStatus) => void;
}

export function PreRegistrationStatusControl({
  status,
  isUpdating,
  onChangeStatus,
}: PreRegistrationStatusControlProps) {
  const nextOptions = ALL_STATUSES.filter((option) => option !== status);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[status]}`}>
        {STATUS_LABEL[status]}
      </span>

      <PermissionGate permission="website.content:write">
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
