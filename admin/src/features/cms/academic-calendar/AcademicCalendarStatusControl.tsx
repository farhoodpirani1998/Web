import { PermissionGate } from "@/components/ui/PermissionGate";

import type { CmsAcademicCalendarStatus } from "./types";

const VALID_TRANSITIONS: Record<CmsAcademicCalendarStatus, CmsAcademicCalendarStatus[]> = {
  draft: ["published", "archived"],
  published: ["archived", "draft"],
  archived: ["draft"],
};

const STATUS_LABEL: Record<CmsAcademicCalendarStatus, string> = {
  draft: "پیش‌نویس",
  published: "منتشرشده",
  archived: "بایگانی",
};

const STATUS_BADGE_CLASS: Record<CmsAcademicCalendarStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  published: "bg-emerald-50 text-emerald-700",
  archived: "bg-amber-50 text-amber-700",
};

export interface AcademicCalendarStatusControlProps {
  status: CmsAcademicCalendarStatus;
  isUpdating: boolean;
  onChangeStatus: (status: CmsAcademicCalendarStatus) => void;
}

export function AcademicCalendarStatusControl({
  status,
  isUpdating,
  onChangeStatus,
}: AcademicCalendarStatusControlProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[status]}`}>
        {STATUS_LABEL[status]}
      </span>

      <PermissionGate permission="website.content:publish">
        {VALID_TRANSITIONS[status].map((next) => (
          <button
            key={next}
            type="button"
            disabled={isUpdating}
            onClick={() => onChangeStatus(next)}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUpdating ? "…" : `انتقال به ${STATUS_LABEL[next]}`}
          </button>
        ))}
      </PermissionGate>
    </div>
  );
}
