import { PreRegistrationStatusControl } from "./PreRegistrationStatusControl";
import type { CmsPreRegistration, CmsPreRegistrationStatus } from "./types";

/** `createdAt` (inherited from `CmsEntityMeta`) IS the submission time — see `types.ts`. */
function formatSubmittedAt(createdAt: string): string {
  return new Date(createdAt).toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Plain "YYYY-MM-DD" from the backend's `date`-typed column — no timezone conversion needed for a date-only value. */
function formatBirthDate(studentBirthDate: string): string {
  return new Date(`${studentBirthDate}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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

/**
 * Read-only detail view for one submission, plus its status control
 * (the only thing that changes here — no edit form, per this module's
 * scope). Same modal chrome as `PreRegistrationDeleteConfirm`/
 * `PortalLinkDeleteConfirm` (fixed overlay, centered card), just wider
 * to fit the full field set.
 */
export interface PreRegistrationDetailProps {
  preRegistration: CmsPreRegistration;
  isUpdatingStatus: boolean;
  onClose: () => void;
  onChangeStatus: (nextStatus: CmsPreRegistrationStatus) => void;
}

export function PreRegistrationDetail({
  preRegistration,
  isUpdatingStatus,
  onClose,
  onChangeStatus,
}: PreRegistrationDetailProps) {
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
          <DetailField label="Student national ID" value={preRegistration.studentNationalId} />
          <DetailField
            label="Birth date"
            value={formatBirthDate(preRegistration.studentBirthDate)}
          />
          <DetailField label="Grade" value={preRegistration.studentGrade} />
          <DetailField label="Submitted" value={formatSubmittedAt(preRegistration.createdAt)} />
          <DetailField
            label="Guardian"
            value={preRegistration.guardianFullName}
            dir="rtl"
          />
          <DetailField label="Guardian phone" value={preRegistration.guardianPhone} dir="ltr" />
          {preRegistration.guardianEmail ? (
            <DetailField label="Guardian email" value={preRegistration.guardianEmail} dir="ltr" />
          ) : null}
        </dl>

        {preRegistration.notes ? (
          <div className="mt-4">
            <dt className="text-xs font-medium text-slate-500">Notes</dt>
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
