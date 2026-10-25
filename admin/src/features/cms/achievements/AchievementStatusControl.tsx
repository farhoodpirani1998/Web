import { PermissionGate } from "@/components/ui/PermissionGate";

import type { CmsAchievementStatus } from "./types";

/**
 * Mirrors the backend's `VALID_TRANSITIONS` so this control only offers a
 * transition the backend will accept. UI convenience only — the real
 * enforcement is `PublishingService.transition`.
 */
const VALID_TRANSITIONS: Record<CmsAchievementStatus, CmsAchievementStatus[]> = {
  draft: ["published", "archived"],
  published: ["archived", "draft"],
  archived: ["draft"],
};

const STATUS_LABEL: Record<CmsAchievementStatus, string> = {
  draft: "پیش‌نویس",
  published: "منتشرشده",
  archived: "بایگانی",
};

const STATUS_BADGE_CLASS: Record<CmsAchievementStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  published: "bg-emerald-50 text-emerald-700",
  archived: "bg-amber-50 text-amber-700",
};

export interface AchievementStatusControlProps {
  status: CmsAchievementStatus;
  isUpdating: boolean;
  onChangeStatus: (status: CmsAchievementStatus) => void;
}

export function AchievementStatusControl({
  status,
  isUpdating,
  onChangeStatus,
}: AchievementStatusControlProps) {
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
