import { useState } from "react";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";
import { useAuth } from "@/features/auth";
import { ApiError } from "@/lib/apiError";
import { formatDateTime } from "@/lib/formatDate";
import type { AdminRole } from "@/types/auth";

import { AdminUserDeleteConfirm } from "./AdminUserDeleteConfirm";
import { CreateAdminUserForm } from "./CreateAdminUserForm";
import { updateAdminUser } from "./api";
import { ROLE_LABELS, type CmsAdminUser } from "./types";
import { useAdminUsers } from "./hooks/useAdminUsers";

/**
 * The Admin Users page (`/admin/admin-users`). Lists CMS admin accounts
 * and lets a super-admin create them, change roles, enable/disable, and
 * delete. Gated behind `website.admins:manage` — the same permission the
 * backend controller requires on every route.
 *
 * The UI mirrors the backend's two safety rules: the acting admin can't
 * disable/delete *their own* row (buttons disabled with an explanatory
 * tooltip), and the sole active super-admin can't be demoted/disabled/
 * deleted — the backend's 409 surfaces as an inline action error if it's
 * attempted anyway.
 */
export function AdminUsersPage() {
  const { admin: me } = useAuth();
  const { admins, isLoading, error, refetch, setAdmins } = useAdminUsers();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<CmsAdminUser | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleChangeRole(admin: CmsAdminUser, role: AdminRole) {
    setActionError(null);
    setUpdatingId(admin.id);
    try {
      const updated = await updateAdminUser(admin.id, { role });
      setAdmins((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleToggleActive(admin: CmsAdminUser) {
    setActionError(null);
    setUpdatingId(admin.id);
    try {
      const updated = await updateAdminUser(admin.id, { isActive: !admin.isActive });
      setAdmins((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "داشبورد" }, { label: "کاربران مدیریت" }]} />

      <PermissionGate
        permission="website.admins:manage"
        fallback={
          <>
            <PageHeader title="کاربران مدیریت" />
            <Section>
              <EmptyState
                title="به کاربران مدیریت دسترسی ندارید"
                description="مدیریت حساب‌های ادمین نیازمند دسترسی ویژه است."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="کاربران مدیریت"
          description="مدیریت حساب‌های کاربری پنل، نقش‌ها و دسترسی‌ها."
        >
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            کاربر جدید
          </button>
        </PageHeader>

        <Section>
          {actionError ? (
            <p role="alert" className="mb-4 text-sm text-red-600">
              {actionError}
            </p>
          ) : null}

          {error ? (
            <p role="alert" className="py-8 text-center text-sm text-red-600">
              {error.message}
            </p>
          ) : isLoading ? (
            <p className="py-8 text-center text-sm text-slate-500">در حال بارگذاری کاربران…</p>
          ) : admins.length === 0 ? (
            <EmptyState title="کاربری یافت نشد" />
          ) : (
            <div className="overflow-x-auto rounded-md border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-slate-500">ایمیل</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-500">نقش</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-500">وضعیت</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-500">تاریخ ایجاد</th>
                    <th className="px-3 py-2 text-right font-medium text-slate-500">اقدامات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {admins.map((admin) => {
                    const isSelf = admin.id === me?.id;
                    const isUpdating = updatingId === admin.id;
                    return (
                      <tr key={admin.id}>
                        <td className="px-3 py-3 align-top">
                          <span dir="ltr" className="font-medium text-slate-900">
                            {admin.email}
                          </span>
                          {isSelf ? (
                            <span className="ms-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                              شما
                            </span>
                          ) : null}
                        </td>
                        <td className="px-3 py-3 align-top">
                          <select
                            aria-label={`نقش ${admin.email}`}
                            value={admin.role}
                            disabled={isUpdating}
                            onChange={(event) =>
                              handleChangeRole(admin, event.target.value as AdminRole)
                            }
                            className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700 disabled:bg-slate-100"
                          >
                            {(Object.keys(ROLE_LABELS) as AdminRole[]).map((role) => (
                              <option key={role} value={role}>
                                {ROLE_LABELS[role]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <span
                            className={
                              admin.isActive
                                ? "rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                                : "rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500"
                            }
                          >
                            {admin.isActive ? "فعال" : "غیرفعال"}
                          </span>
                        </td>
                        <td className="px-3 py-3 align-top text-slate-600">
                          {formatDateTime(admin.createdAt)}
                        </td>
                        <td className="px-3 py-3 text-right align-top">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              disabled={isUpdating || isSelf}
                              title={
                                isSelf ? "نمی‌توانید حساب خودتان را غیرفعال کنید" : undefined
                              }
                              onClick={() => handleToggleActive(admin)}
                              className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {admin.isActive ? "غیرفعال" : "فعال کردن"}
                            </button>
                            <button
                              type="button"
                              disabled={isUpdating || isSelf}
                              title={isSelf ? "نمی‌توانید حساب خودتان را حذف کنید" : undefined}
                              onClick={() => setPendingDelete(admin)}
                              className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {isFormOpen ? (
          <CreateAdminUserForm
            onCancel={() => setIsFormOpen(false)}
            onCreated={() => {
              setIsFormOpen(false);
              refetch();
            }}
          />
        ) : null}

        {pendingDelete ? (
          <AdminUserDeleteConfirm
            admin={pendingDelete}
            onCancel={() => setPendingDelete(null)}
            onDeleted={() => {
              setPendingDelete(null);
              refetch();
            }}
          />
        ) : null}
      </PermissionGate>
    </PageContainer>
  );
}
