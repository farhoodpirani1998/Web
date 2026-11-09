import { useState } from "react";
import { Copy } from "lucide-react";

import { PermissionGate } from "@/components/ui/PermissionGate";
import type { CmsAdminUser } from "@/features/cms/admin-users";
import type { CmsCampus } from "@/features/cms/campuses";
import { PreRegistrationStatusControl } from "./PreRegistrationStatusControl";
import { getPreRegistrationGradeLabel } from "./gradeLabels";
import type {
  CmsPreRegistration,
  CmsPreRegistrationStatus,
  UpdatePreRegistrationAssignmentPayload,
} from "./types";

/** `createdAt` (inherited from `CmsEntityMeta`) IS the submission time — see `types.ts`. */
function formatSubmittedAt(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/** Plain "YYYY-MM-DD" from the backend's `date`-typed column — no timezone conversion needed for a date-only value. */
function formatBirthDate(studentBirthDate: string): string {
  const date = new Date(`${studentBirthDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

interface DetailFieldProps {
  label: string;
  value: string;
  dir?: "rtl" | "ltr";
}

function DetailField({ label, value, dir }: DetailFieldProps) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-900" dir={dir}>
        {value}
      </dd>
    </div>
  );
}

function CopyableDetailField({ label, value }: { label: string; value: string }) {
  const [copyMessage, setCopyMessage] = useState("");

  async function copyValue() {
    try {
      await navigator.clipboard.writeText(value);
      setCopyMessage("کپی شد.");
    } catch {
      setCopyMessage("کپی خودکار در این مرورگر در دسترس نیست.");
    }
  }

  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-0.5 flex items-center gap-2 text-sm text-slate-900" dir="ltr">
        <span>{value}</span>
        <button
          type="button"
          onClick={() => void copyValue()}
          className="rounded p-1 text-slate-500 hover:bg-slate-100"
          aria-label={`کپی ${label}`}
          title={`کپی ${label}`}
        >
          <Copy size={14} />
        </button>
      </dd>
      {copyMessage ? (
        <p role="status" className="mt-1 text-xs text-slate-500">
          {copyMessage}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Read-only detail view for one submission, plus its status control
 * and its editable owner/follow-up fields. Same modal chrome as `PreRegistrationDeleteConfirm`/
 * `PortalLinkDeleteConfirm` (fixed overlay, centered card), just wider
 * to fit the full field set.
 */
export interface PreRegistrationDetailProps {
  preRegistration: CmsPreRegistration;
  admins: CmsAdminUser[];
  campuses: CmsCampus[];
  isUpdatingStatus: boolean;
  isUpdatingFollowUp: boolean;
  saveError?: string | null;
  onClose: () => void;
  onChangeStatus: (nextStatus: CmsPreRegistrationStatus) => void;
  onSaveFollowUp: (payload: UpdatePreRegistrationAssignmentPayload) => void;
}

function toLocalDateTime(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function PreRegistrationDetail({
  preRegistration,
  admins,
  campuses,
  isUpdatingStatus,
  isUpdatingFollowUp,
  saveError,
  onClose,
  onChangeStatus,
  onSaveFollowUp,
}: PreRegistrationDetailProps) {
  const [assignedAdminId, setAssignedAdminId] = useState(
    preRegistration.assignedAdminId ?? "",
  );
  const [followUpAt, setFollowUpAt] = useState(
    toLocalDateTime(preRegistration.followUpAt),
  );
  const campus = campuses.find((item) => item.id === preRegistration.campusId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900" dir="rtl">
            {preRegistration.studentFirstName} {preRegistration.studentLastName}
          </h2>
          <PreRegistrationStatusControl
            status={preRegistration.status}
            isUpdating={isUpdatingStatus}
            onChangeStatus={onChangeStatus}
          />
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-4">
          {preRegistration.referenceCode ? (
            <DetailField
              label="کد پیگیری"
              value={preRegistration.referenceCode}
              dir="ltr"
            />
          ) : null}
          <CopyableDetailField
            label="کد ملی دانش‌آموز"
            value={preRegistration.studentNationalId}
          />
          <DetailField
            label="تاریخ تولد"
            value={formatBirthDate(preRegistration.studentBirthDate)}
          />
          <DetailField
            label="پایه"
            value={getPreRegistrationGradeLabel(preRegistration.studentGrade)}
          />
          <DetailField label="پردیس" value={campus?.title.fa ?? "مشترک"} />
          <DetailField
            label="زمان ارسال"
            value={formatSubmittedAt(preRegistration.createdAt)}
          />
          <DetailField
            label="سرپرست"
            value={preRegistration.guardianFullName}
            dir="rtl"
          />
          <CopyableDetailField
            label="تلفن سرپرست"
            value={preRegistration.guardianPhone}
          />
          {preRegistration.guardianEmail ? (
            <DetailField
              label="ایمیل سرپرست"
              value={preRegistration.guardianEmail}
              dir="ltr"
            />
          ) : null}
        </dl>

        <PermissionGate permission="website.content:write">
          <div className="mt-5 grid gap-3 sm:grid-cols-2" dir="rtl">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              مسئول پیگیری
              <select
                value={assignedAdminId}
                onChange={(event) => setAssignedAdminId(event.target.value)}
                disabled={isUpdatingFollowUp}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              >
                <option value="">بدون مسئول</option>
                {admins
                  .filter((admin) => admin.isActive || admin.id === assignedAdminId)
                  .map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.email}
                    </option>
                  ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              تاریخ پیگیری بعدی
              <input
                type="datetime-local"
                value={followUpAt}
                onChange={(event) => setFollowUpAt(event.target.value)}
                disabled={isUpdatingFollowUp}
                dir="ltr"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </label>
            <button
              type="button"
              onClick={() =>
                onSaveFollowUp({
                  assignedAdminId: assignedAdminId || null,
                  followUpAt: followUpAt ? new Date(followUpAt).toISOString() : null,
                })
              }
              disabled={isUpdatingFollowUp}
              className="bg-brand-700 rounded-md px-3 py-2 text-sm font-medium text-white disabled:opacity-60 sm:col-span-2"
            >
              {isUpdatingFollowUp ? "در حال ذخیره…" : "ذخیره مسئول و پیگیری"}
            </button>
          </div>
        </PermissionGate>

        {saveError ? (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {saveError}
          </p>
        ) : null}

        {preRegistration.notes ? (
          <div className="mt-4">
            <dt className="text-xs font-medium text-slate-500">یادداشت‌ها</dt>
            <dd className="mt-0.5 whitespace-pre-wrap text-sm text-slate-900" dir="rtl">
              {preRegistration.notes}
            </dd>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
