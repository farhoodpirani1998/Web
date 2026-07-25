import { useState } from "react";

import { PermissionGate } from "@/components/ui/PermissionGate";

/**
 * Sets/clears `Teacher.publishAt` via the dedicated `PATCH
 * /admin/teachers/:id/schedule` action (`scheduleTeacher` in
 * `./api.ts`) — distinct from `status`, per the entity's own doc
 * comment: a `published` teacher whose `publishAt` is still in the
 * future stays out of the sitemap/public API until that moment. Gated
 * behind `website.content:publish`, same permission
 * `TeacherStatusControl` uses, matching `TeachersController.schedule`'s
 * own guard.
 *
 * A small inline editor (native `datetime-local` input) rather than a
 * full modal — scheduling is a single field, doesn't warrant the
 * dialog weight `TeacherForm`/`TeacherDeleteConfirm` use. Identical to
 * `features/cms/events/EventScheduleControl.tsx`.
 */
export interface TeacherScheduleControlProps {
  /** ISO 8601 timestamp, or `undefined` if not currently scheduled. */
  publishAt: string | undefined;
  isUpdating: boolean;
  onSchedule: (publishAt: string | null) => void;
}

/** `<input type="datetime-local">` needs `YYYY-MM-DDTHH:mm` in local time, not a raw ISO string with a `Z`/offset. */
function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function TeacherScheduleControl({
  publishAt,
  isUpdating,
  onSchedule,
}: TeacherScheduleControlProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(() => (publishAt ? toDatetimeLocalValue(publishAt) : ""));

  function handleOpen() {
    setDraft(publishAt ? toDatetimeLocalValue(publishAt) : "");
    setIsEditing(true);
  }

  function handleSave() {
    if (!draft) return;
    onSchedule(new Date(draft).toISOString());
    setIsEditing(false);
  }

  function handleClear() {
    onSchedule(null);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-1.5">
        <input
          type="datetime-local"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={isUpdating}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={handleSave}
            disabled={isUpdating || !draft}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUpdating ? "…" : "Save"}
          </button>
          {publishAt ? (
            <button
              type="button"
              onClick={handleClear}
              disabled={isUpdating}
              className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            disabled={isUpdating}
            className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {publishAt ? (
        <span className="text-xs text-slate-600">{new Date(publishAt).toLocaleString()}</span>
      ) : (
        <span className="text-xs text-slate-400">Not scheduled</span>
      )}

      <PermissionGate permission="website.content:publish">
        <button
          type="button"
          onClick={handleOpen}
          disabled={isUpdating}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {publishAt ? "Reschedule…" : "Schedule…"}
        </button>
      </PermissionGate>
    </div>
  );
}
