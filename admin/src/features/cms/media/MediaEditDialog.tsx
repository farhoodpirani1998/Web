import { useId, useState, type FormEvent } from "react";

import { ApiError } from "@/lib/apiError";

import { updateMedia } from "./api";
import { setCachedMedia } from "./mediaCache";
import type { CmsMedia } from "./types";

export interface MediaEditDialogProps {
  media: CmsMedia;
  onCancel: () => void;
  onSaved: (media: CmsMedia) => void;
}

export function MediaEditDialog({ media, onCancel, onSaved }: MediaEditDialogProps) {
  const altTextId = useId();
  const [altText, setAltText] = useState(media.altText);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canSubmit = altText.trim().length > 0 && !isSaving;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setIsSaving(true);
    try {
      const saved = await updateMedia(media.id, { altText: altText.trim() });
      setCachedMedia(saved);
      onSaved(saved);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
      );
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">ویرایش متن جایگزین تصویر</h2>
        <p className="mt-1 text-sm text-slate-500">
          این توضیح در تمام بخش‌هایی که از این فایل استفاده می‌کنند به‌روز می‌شود.
        </p>

        <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={altTextId} className="text-sm font-medium text-slate-900">
              متن جایگزین
            </label>
            <input
              id={altTextId}
              type="text"
              maxLength={500}
              required
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
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
              disabled={!canSubmit}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSaving ? "در حال ذخیره…" : "ذخیره"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
