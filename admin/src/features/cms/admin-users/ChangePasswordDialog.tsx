import { useId, useState, type FormEvent } from "react";

import { ApiError } from "@/lib/apiError";

import { changeOwnPassword } from "./api";

/**
 * Self-service password-change dialog, opened from the header account
 * menu. Requires the current password (`changeOwnPassword` →
 * `POST /admin/auth/change-password`), matching the backend which
 * verifies it before writing. On success it shows a confirmation and
 * closes on demand.
 */
export interface ChangePasswordDialogProps {
  onCancel: () => void;
}

export function ChangePasswordDialog({ onCancel }: ChangePasswordDialogProps) {
  const currentId = useId();
  const newId = useId();
  const confirmId = useId();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit =
    currentPassword.length > 0 && newPassword.length >= 12 && !mismatch && !isSaving;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || mismatch) return;

    setError(null);
    setIsSaving(true);
    try {
      await changeOwnPassword(currentPassword, newPassword);
      setDone(true);
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
        <h2 className="text-lg font-semibold text-slate-900">تغییر رمز عبور</h2>

        {done ? (
          <>
            <p className="mt-3 text-sm text-emerald-700">رمز عبور با موفقیت تغییر کرد.</p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                بستن
              </button>
            </div>
          </>
        ) : (
          <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={currentId} className="text-sm font-medium text-slate-900">
                رمز عبور فعلی
              </label>
              <input
                id={currentId}
                type="password"
                dir="ltr"
                required
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                disabled={isSaving}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={newId} className="text-sm font-medium text-slate-900">
                رمز عبور جدید
              </label>
              <input
                id={newId}
                type="password"
                dir="ltr"
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                disabled={isSaving}
                className={inputClass}
              />
              <p className="text-xs text-slate-500">حداقل ۱۲ کاراکتر.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={confirmId} className="text-sm font-medium text-slate-900">
                تکرار رمز عبور جدید
              </label>
              <input
                id={confirmId}
                type="password"
                dir="ltr"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={isSaving}
                className={inputClass}
              />
              {mismatch ? (
                <p className="text-xs text-red-600">رمزهای عبور یکسان نیستند.</p>
              ) : null}
            </div>

            {error ? (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            ) : null}

            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSaving}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={!canSubmit || mismatch}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isSaving ? "در حال ذخیره…" : "تغییر رمز"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
