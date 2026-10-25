import { useId, useState, type FormEvent } from "react";

import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";
import type { AdminRole } from "@/types/auth";

import { createAdminUser } from "./api";
import { ROLE_LABELS, type CmsAdminUser } from "./types";

/** Create dialog for `POST /admin/admin-users`. Same plain fixed-overlay shape as the other forms. */
export interface CreateAdminUserFormProps {
  onCancel: () => void;
  onCreated: (admin: CmsAdminUser) => void;
}

const ROLE_OPTIONS = Object.entries(ROLE_LABELS) as [AdminRole, string][];

export function CreateAdminUserForm({ onCancel, onCreated }: CreateAdminUserFormProps) {
  const emailId = useId();
  const passwordId = useId();
  const roleId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("content_editor");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isDirty } = useIsDirty({ email, password, role });
  const { isConfirmOpen, guardedAction, confirmLeave, cancelLeave } =
    useUnsavedChangesGuard(isDirty);

  const canSubmit = email.trim().length > 0 && password.length >= 12 && !isSaving;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setIsSaving(true);
    try {
      const created = await createAdminUser({ email: email.trim(), password, role });
      onCreated(created);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.");
      setIsSaving(false);
    }
  }

  const inputClass =
    "rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">کاربر مدیریت جدید</h2>

        <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={emailId} className="text-sm font-medium text-slate-900">
              ایمیل
            </label>
            <input
              id={emailId}
              type="email"
              dir="ltr"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSaving}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={passwordId} className="text-sm font-medium text-slate-900">
              رمز عبور
            </label>
            <input
              id={passwordId}
              type="password"
              dir="ltr"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSaving}
              className={inputClass}
            />
            <p className="text-xs text-slate-500">حداقل ۱۲ کاراکتر.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={roleId} className="text-sm font-medium text-slate-900">
              نقش
            </label>
            <select
              id={roleId}
              value={role}
              onChange={(event) => setRole(event.target.value as AdminRole)}
              disabled={isSaving}
              className={inputClass}
            >
              {ROLE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => guardedAction(onCancel)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSaving ? "در حال ایجاد…" : "ایجاد"}
            </button>
          </div>
        </form>
      </div>

      {isConfirmOpen ? (
        <UnsavedChangesDialog onDiscard={confirmLeave} onKeepEditing={cancelLeave} />
      ) : null}
    </div>
  );
}
