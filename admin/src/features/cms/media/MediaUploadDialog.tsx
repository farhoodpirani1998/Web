import { useId, useState, type FormEvent } from "react";

import { ApiError } from "@/lib/apiError";

import { uploadMedia } from "./api";
import { setCachedMedia } from "./mediaCache";
import type { CmsMedia } from "./types";

/**
 * Upload dialog for `POST /admin/media`. A plain fixed-overlay modal —
 * no `Dialog` primitive exists in `components/ui/` yet (nothing else in
 * the admin needed one before this), so this is the first one. Once a
 * second module needs a modal, this is the candidate to extract into
 * `features/cms/components/` (see that folder's README) rather than
 * duplicating the overlay markup again.
 *
 * `accept` on the file input is a UX hint only — JPEG/PNG/WebP is
 * today's documented default (`media.constants.ts`'s `KNOWN_MIME_TYPES`),
 * but that's env-configurable server-side and there's no endpoint to
 * ask the backend what's currently allowed (and this sprint adds none).
 * The backend's own validation is authoritative either way; a rejected
 * file just surfaces here as `error` from `uploadMedia`.
 */
export interface MediaUploadDialogProps {
  onCancel: () => void;
  onUploaded: (media: CmsMedia) => void;
}

export function MediaUploadDialog({ onCancel, onUploaded }: MediaUploadDialogProps) {
  const fileId = useId();
  const altTextId = useId();

  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = Boolean(file) && altText.trim().length > 0 && !isUploading;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || !altText.trim()) return;

    setError(null);
    setIsUploading(true);
    setProgress(0);

    try {
      const media = await uploadMedia({ file, altText: altText.trim() }, setProgress);
      setCachedMedia(media);
      onUploaded(media);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setIsUploading(false);
    }
    // No `finally` resetting isUploading on success: the dialog is
    // about to be unmounted by the parent (`onUploaded` closes it), same
    // reasoning as `LoginPage`'s submit handler.
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Upload media</h2>

        <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={fileId} className="text-sm font-medium text-slate-900">
              File
            </label>
            <input
              id={fileId}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              disabled={isUploading}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="text-sm text-slate-700 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-50 disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={altTextId} className="text-sm font-medium text-slate-900">
              Alt text
            </label>
            <input
              id={altTextId}
              type="text"
              required
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              disabled={isUploading}
              placeholder="Describes the image for accessibility"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          {isUploading ? (
            <div className="flex flex-col gap-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-900 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">Uploading… {progress}%</p>
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isUploading}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isUploading ? "Uploading…" : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
