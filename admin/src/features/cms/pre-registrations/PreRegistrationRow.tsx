import { PermissionGate } from "@/components/ui/PermissionGate";

import { PreRegistrationStatusControl } from "./PreRegistrationStatusControl";
import type { CmsPreRegistration, CmsPreRegistrationStatus } from "./types";

/** `createdAt` (inherited from `CmsEntityMeta`) IS the submission time — see `types.ts`. */
function formatSubmittedAt(createdAt: string): string {
  return new Date(createdAt).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export interface PreRegistrationRowProps {
  preRegistration: CmsPreRegistration;
  isUpdatingStatus: boolean;
  onViewDetail: (preRegistration: CmsPreRegistration) => void;
  onDeleteRequest: (preRegistration: CmsPreRegistration) => void;
  onChangeStatus: (
    preRegistration: CmsPreRegistration,
    nextStatus: CmsPreRegistrationStatus,
  ) => void;
}

export function PreRegistrationRow({
  preRegistration,
  isUpdatingStatus,
  onViewDetail,
  onDeleteRequest,
  onChangeStatus,
}: PreRegistrationRowProps) {
  return (
    <tr>
      <td className="px-3 py-3 align-top">
        <p className="font-medium text-slate-900" dir="rtl">
          {preRegistration.studentFirstName} {preRegistration.studentLastName}
        </p>
        <p className="mt-0.5 text-xs text-slate-500" dir="rtl">
          {preRegistration.guardianFullName}
        </p>
      </td>

      <td className="px-3 py-3 align-top text-slate-600">
        <p dir="ltr" className="text-left">
          {preRegistration.guardianPhone}
        </p>
        {preRegistration.guardianEmail ? (
          <p className="mt-0.5 text-xs text-slate-500">{preRegistration.guardianEmail}</p>
        ) : null}
      </td>

      <td className="px-3 py-3 align-top text-slate-600">{preRegistration.studentGrade}</td>

      <td className="px-3 py-3 align-top">
        <PreRegistrationStatusControl
          status={preRegistration.status}
          isUpdating={isUpdatingStatus}
          onChangeStatus={(next) => onChangeStatus(preRegistration, next)}
        />
      </td>

      <td className="whitespace-nowrap px-3 py-3 align-top text-slate-500">
        {formatSubmittedAt(preRegistration.createdAt)}
      </td>

      <td className="px-3 py-3 text-right align-top">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onViewDetail(preRegistration)}
            className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            View
          </button>
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={() => onDeleteRequest(preRegistration)}
              className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </PermissionGate>
        </div>
      </td>
    </tr>
  );
}
