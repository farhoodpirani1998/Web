/**
 * Types for the CMS admin-users module, mirroring the backend
 * `AdminUsersController` (`/admin/admin-users`) and its DTOs. Same
 * "mirror, don't import" reasoning as every other `types.ts` here.
 */

import type { AdminPermission, AdminRole } from "@/types/auth";

/** One admin account as returned by `GET /admin/admin-users` (never the password hash). */
export interface CmsAdminUser {
  id: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  permissions: AdminPermission[];
  createdAt: string;
  updatedAt: string;
}

/** Body for `POST /admin/admin-users`. Mirrors `CreateAdminUserDto`. */
export interface CreateAdminUserPayload {
  email: string;
  password: string;
  role: AdminRole;
}

/** Body for `PATCH /admin/admin-users/:id`. Mirrors `UpdateAdminUserDto`. */
export interface UpdateAdminUserPayload {
  role?: AdminRole;
  isActive?: boolean;
}

/** Body for `POST /admin/auth/change-password`. */
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

/** Persian labels for each role, shared by the roster + form. */
export const ROLE_LABELS: Record<AdminRole, string> = {
  website_super_admin: "مدیر ارشد سایت",
  content_editor: "ویرایشگر محتوا",
  publisher: "ناشر",
  seo_marketing_manager: "مدیر سئو و بازاریابی",
  media_manager: "مدیر رسانه",
};
