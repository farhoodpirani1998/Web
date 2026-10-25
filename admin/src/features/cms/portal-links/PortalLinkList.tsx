import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiError } from "@/lib/apiError";

import { PortalLinkRow } from "./PortalLinkRow";
import type { CmsPortalLink } from "./types";

/**
 * Renders `usePortalLinks`'s result — `PortalLinksPage` owns the hook;
 * this component only knows how to display whatever list/loading/error
 * state it's handed, same split as `features/cms/faq/FaqList.tsx`.
 */
export interface PortalLinkListProps {
  links: CmsPortalLink[];
  isLoading: boolean;
  error: ApiError | null;
  isReordering: boolean;
  togglingVisibleId: string | null;
  onEdit: (link: CmsPortalLink) => void;
  onDeleteRequest: (link: CmsPortalLink) => void;
  onToggleVisible: (link: CmsPortalLink) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function PortalLinkList({
  links,
  isLoading,
  error,
  isReordering,
  togglingVisibleId,
  onEdit,
  onDeleteRequest,
  onToggleVisible,
  onReorder,
}: PortalLinkListProps) {
  if (isLoading) {
    return <p className="py-8 text-center text-sm text-slate-500">در حال بارگذاری لینک‌های سامانه…</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  }

  if (links.length === 0) {
    return (
      <EmptyState
        title="هنوز لینک سامانه‌ای نیست"
        description="برای شروع یک پیوند به سامانه خارجی (پرتابل والدین، LMS، ایمیل و غیره) اضافه کنید."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="w-10 px-3 py-2 text-left font-medium text-slate-500">
              <span className="sr-only">مرتب‌سازی</span>
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              برچسب
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              نشانی
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              وضعیت
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium text-slate-500">
              <span className="sr-only">اقدامات</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {links.map((link, index) => (
            <PortalLinkRow
              key={link.id}
              link={link}
              index={index}
              rowCount={links.length}
              isReordering={isReordering}
              isTogglingVisible={togglingVisibleId === link.id}
              onEdit={onEdit}
              onDeleteRequest={onDeleteRequest}
              onToggleVisible={onToggleVisible}
              onReorder={onReorder}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
