/**
 * Pre-Registration List using TanStack Table v8.
 */
import { useMemo, useState } from "react";
import {
  useLegacyTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type LegacyColumnDef as ColumnDef,
} from "@tanstack/react-table/legacy";
import { flexRender, type SortingState } from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eye,
  Trash2,
} from "lucide-react";

import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import type { CmsAdminUser } from "@/features/cms/admin-users";
import type { CmsCampus } from "@/features/cms/campuses";
import type { ApiError } from "@/lib/apiError";
import type { CmsPreRegistration, CmsPreRegistrationStatus } from "./types";
import {
  getPreRegistrationGradeLabel,
  PRE_REGISTRATION_GRADE_LABELS,
} from "./gradeLabels";
import { createPreRegistrationCsv } from "./exportCsv";
import { normalizeDigits } from "./validation";
import { PreRegistrationStatusControl } from "./PreRegistrationStatusControl";

const PRE_REGISTRATION_SKELETON_KEYS = [
  "pre-registration-skeleton-1",
  "pre-registration-skeleton-2",
  "pre-registration-skeleton-3",
  "pre-registration-skeleton-4",
  "pre-registration-skeleton-5",
] as const;

export interface PreRegistrationListProps {
  preRegistrations: CmsPreRegistration[];
  isLoading: boolean;
  error: ApiError | null;
  admins?: CmsAdminUser[];
  campuses?: CmsCampus[];
  statusFilter?: CmsPreRegistrationStatus;
  updatingStatusId: string | null;
  onDeleteRequest: (item: CmsPreRegistration) => void;
  onViewDetail: (item: CmsPreRegistration) => void;
  onChangeStatus: (item: CmsPreRegistration, status: CmsPreRegistrationStatus) => void;
}

function formatPersianDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function PreRegistrationList({
  preRegistrations,
  isLoading,
  error,
  admins = [],
  campuses = [],
  updatingStatusId,
  onDeleteRequest,
  onViewDetail,
  onChangeStatus,
}: PreRegistrationListProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const gradeOptions = useMemo(() => {
    const grades = new Set([
      ...Object.keys(PRE_REGISTRATION_GRADE_LABELS),
      ...preRegistrations.map((item) => item.studentGrade),
    ]);
    return Array.from(grades).sort();
  }, [preRegistrations]);

  const filteredRegistrations = useMemo(() => {
    const query = normalizeDigits(search.trim()).toLocaleLowerCase();
    return preRegistrations.filter((item) => {
      const submittedDate = item.createdAt.slice(0, 10);
      if (gradeFilter && item.studentGrade !== gradeFilter) return false;
      if (dateFrom && submittedDate < dateFrom) return false;
      if (dateTo && submittedDate > dateTo) return false;

      const searchText = normalizeDigits(
        [
          item.studentFirstName,
          item.studentLastName,
          item.studentNationalId,
          item.guardianPhone,
          item.referenceCode ?? "",
        ].join(" "),
      ).toLocaleLowerCase();
      return !query || searchText.includes(query);
    });
  }, [preRegistrations, search, gradeFilter, dateFrom, dateTo]);

  const columns = useMemo<ColumnDef<CmsPreRegistration>[]>(
    () => [
      {
        accessorKey: "studentFirstName",
        header: "نام",
        cell: ({ row }) =>
          `${row.original.studentFirstName} ${row.original.studentLastName}`,
      },
      {
        accessorKey: "studentNationalId",
        header: "کد ملی",
        cell: ({ row }) => (
          <div className="flex items-center gap-1" dir="ltr">
            <span>{row.original.studentNationalId}</span>
            <button
              type="button"
              onClick={() =>
                void copyToClipboard(row.original.studentNationalId, setCopyMessage)
              }
              className="rounded p-1 text-slate-500 hover:bg-slate-100"
              aria-label={`کپی کد ملی ${row.original.studentFirstName} ${row.original.studentLastName}`}
              title="کپی کد ملی"
            >
              <Copy size={14} />
            </button>
          </div>
        ),
      },
      {
        accessorKey: "referenceCode",
        header: "کد پیگیری",
        cell: ({ row }) => (
          <span dir="ltr" className="text-left">
            {row.original.referenceCode ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "studentGrade",
        header: "پایه",
        cell: ({ row }) => getPreRegistrationGradeLabel(row.original.studentGrade),
      },
      {
        accessorKey: "campusId",
        header: "پردیس",
        cell: ({ row }) => {
          if (!row.original.campusId) return "مشترک";
          return campuses.find((campus) => campus.id === row.original.campusId)?.title.fa ?? "—";
        },
      },
      {
        accessorKey: "assignedAdminId",
        header: "مسئول پیگیری",
        cell: ({ row }) =>
          admins.find((admin) => admin.id === row.original.assignedAdminId)?.email ?? "—",
      },
      {
        accessorKey: "followUpAt",
        header: "تاریخ پیگیری",
        cell: ({ row }) =>
          row.original.followUpAt ? formatPersianDate(row.original.followUpAt) : "—",
      },
      {
        accessorKey: "status",
        header: "وضعیت",
        cell: ({ row }) => (
          <PreRegistrationStatusControl
            status={row.original.status}
            isUpdating={updatingStatusId === row.original.id}
            onChangeStatus={(nextStatus) => onChangeStatus(row.original, nextStatus)}
          />
        ),
      },
      {
        accessorKey: "createdAt",
        header: "تاریخ ثبت",
        cell: ({ getValue }) => formatPersianDate(getValue() as string),
      },
      {
        id: "actions",
        header: "عملیات",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onViewDetail(row.original)}
              aria-label={`جزئیات ${row.original.studentFirstName} ${row.original.studentLastName}`}
              className="hover:bg-brand-50 rounded p-1"
            >
              <Eye size={16} />
            </button>
            <button
              type="button"
              onClick={() => onDeleteRequest(row.original)}
              aria-label={`حذف ${row.original.studentFirstName} ${row.original.studentLastName}`}
              className="rounded p-1 text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [admins, campuses, onDeleteRequest, onViewDetail, onChangeStatus, updatingStatusId],
  );

  const table = useLegacyTable({
    data: filteredRegistrations,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {PRE_REGISTRATION_SKELETON_KEYS.map((key) => (
          <Skeleton key={key} className="h-10 w-full" />
        ))}
      </div>
    );
  }
  if (error) return <EmptyState title="خطا" description={error.message} />;
  if (preRegistrations.length === 0) {
    return (
      <EmptyState title="موردی یافت نشد" description="هیچ پیش‌ثبت‌نامی موجود نیست." />
    );
  }

  function exportCsv() {
    const blob = new Blob([createPreRegistrationCsv(filteredRegistrations)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pre-registrations.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div dir="rtl" className="overflow-x-auto rounded-lg border shadow-sm">
      <div className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-5">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="جستجو بر اساس نام، کد ملی یا تلفن"
          aria-label="جستجوی پیش‌ثبت‌نام"
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        <select
          value={gradeFilter}
          onChange={(event) => setGradeFilter(event.target.value)}
          aria-label="فیلتر بر اساس پایه"
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">همه پایه‌ها</option>
          {gradeOptions.map((grade) => (
            <option key={grade} value={grade}>
              {getPreRegistrationGradeLabel(grade)}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-xs text-slate-600">
          از تاریخ
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            aria-label="از تاریخ ثبت"
            className="min-w-0 flex-1 rounded-md border px-2 py-2 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-600">
          تا تاریخ
          <input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            aria-label="تا تاریخ ثبت"
            className="min-w-0 flex-1 rounded-md border px-2 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={exportCsv}
          disabled={filteredRegistrations.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm disabled:opacity-50"
        >
          <Download size={16} />
          خروجی CSV
        </button>
      </div>
      {copyMessage ? (
        <p role="status" className="px-3 text-xs text-slate-600">
          {copyMessage}
        </p>
      ) : null}
      {filteredRegistrations.length === 0 ? (
        <EmptyState
          title="موردی یافت نشد"
          description="فیلترهای انتخاب‌شده نتیجه‌ای ندارند."
        />
      ) : (
        <>
          <table className="w-full text-sm">
            <thead className="bg-brand-50 text-brand-900">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-right font-medium">
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="hover:text-brand-700 flex items-center gap-1"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <ArrowUpDown size={14} />
                      </button>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between border-t p-3">
            <div className="text-xs text-gray-500">
              صفحه {table.getState().pagination.pageIndex + 1} از {table.getPageCount()}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="صفحه قبل"
                className="rounded-md border px-2 py-1 text-xs disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="صفحه بعد"
                className="rounded-md border px-2 py-1 text-xs disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

async function copyToClipboard(value: string, setMessage: (message: string) => void) {
  try {
    await navigator.clipboard.writeText(value);
    setMessage("کد ملی کپی شد.");
  } catch {
    setMessage("کپی خودکار در این مرورگر در دسترس نیست.");
  }
}
