import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiError } from "@/lib/apiError";

import { PreRegistrationRow } from "./PreRegistrationRow";
import type { CmsPreRegistration, CmsPreRegistrationStatus } from "./types";

/**
 * Renders `usePreRegistrations`'s result — `PreRegistrationsPage` owns
 * the hook; this component only knows how to display whatever
 * list/loading/error state it's handed, same split as
 * `features/cms/portal-links/PortalLinkList.tsx`.
 */
export interface PreRegistrationListProps {
  preRegistrations: CmsPreRegistration[];
  isLoading: boolean;
  error: ApiError | null;
  statusFilter: CmsPreRegistrationStatus | undefined;
  updatingStatusId: string | null;
  onViewDetail: (preRegistration: CmsPreRegistration) => void;
  onDeleteRequest: (preRegistration: CmsPreRegistration) => void;
  onChangeStatus: (
    preRegistration: CmsPreRegistration,
    nextStatus: CmsPreRegistrationStatus,
  ) => void;
}

export function PreRegistrationList({
  preRegistrations,
  isLoading,
  error,
  statusFilter,
  updatingStatusId,
  onViewDetail,
  onDeleteRequest,
  onChangeStatus,
}: PreRegistrationListProps) {
  if (isLoading) {
    return <p className="py-8 text-center text-sm text-slate-500">در حال بارگذاری درخواست‌ها…</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  }

  if (preRegistrations.length === 0) {
    return (
      <EmptyState
        title={statusFilter ? `No ${statusFilter} submissions` : "هنوز درخواستی نیست"}
        description="درخواست‌های پیش‌ثبت‌نام از سایت اینجا نمایش داده می‌شوند."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              دانش‌آموز
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              اطلاعات تماس سرپرست
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              پایه
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              وضعیت
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              زمان ارسال
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium text-slate-500">
              <span className="sr-only">اقدامات</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {preRegistrations.map((preRegistration) => (
            <PreRegistrationRow
              key={preRegistration.id}
              preRegistration={preRegistration}
              isUpdatingStatus={updatingStatusId === preRegistration.id}
              onViewDetail={onViewDetail}
              onDeleteRequest={onDeleteRequest}
              onChangeStatus={onChangeStatus}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
