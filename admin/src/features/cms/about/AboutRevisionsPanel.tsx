import { useEffect, useState } from "react";

import { PermissionGate } from "@/components/ui/PermissionGate";
import { ApiError } from "@/lib/apiError";

import { fetchAboutRevisions, restoreAboutRevision } from "./api";
import type { CmsAbout, CmsAboutRevision } from "./types";

/**
 * Revision history dialog for the singleton About page — `GET
 * /admin/about/revisions` plus a restore action, gated behind
 * `website.revisions:view`/`website.revisions:restore` respectively
 * (matching `AboutController.listRevisions`/`restoreRevision`'s own
 * guards). About is one of the backend's revision-enabled types (see
 * `types.ts`'s top comment).
 *
 * Same plain fixed-overlay modal shape as
 * `features/cms/campuses/CampusRevisionsPanel.tsx` (see that file's
 * comment on why there's no shared `Dialog` primitive yet), just with
 * no `:id` param anywhere — there's exactly one About page. Restoring
 * closes the dialog and hands the restored page back to the caller
 * (`AboutService.restoreRevision` returns the live, updated row —
 * restoring records a new revision itself, non-destructive per
 * `RevisionsService`'s own doc comment).
 *
 * `about.title` is `Translatable<string>` (see `types.ts`'s top
 * comment) — rendered with `dir="rtl"`, same as `CampusRevisionsPanel`'s
 * `campus.title.fa`.
 */
export interface AboutRevisionsPanelProps {
  about: CmsAbout;
  onClose: () => void;
  onRestored: (about: CmsAbout) => void;
}

export function AboutRevisionsPanel({ about, onClose, onRestored }: AboutRevisionsPanelProps) {
  const [revisions, setRevisions] = useState<CmsAboutRevision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoringVersion, setRestoringVersion] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchAboutRevisions()
      .then((list) => {
        if (!cancelled) setRevisions(list);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRestore(versionNumber: number) {
    setRestoringVersion(versionNumber);
    setError(null);

    try {
      const restored = await restoreAboutRevision(versionNumber);
      onRestored(restored);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setRestoringVersion(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Revision history</h2>
            <p className="mt-0.5 text-sm text-slate-600" dir="rtl">
              {about.title.fa}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            Close
          </button>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <p className="py-8 text-center text-sm text-slate-500">Loading revisions…</p>
        ) : revisions.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No revisions recorded yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-slate-200">
            {revisions.map((revision) => (
              <li key={revision.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Version {revision.versionNumber}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {new Date(revision.createdAt).toLocaleString()}
                  </p>
                </div>
                <PermissionGate permission="website.revisions:restore">
                  <button
                    type="button"
                    onClick={() => handleRestore(revision.versionNumber)}
                    disabled={restoringVersion !== null}
                    className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {restoringVersion === revision.versionNumber ? "Restoring…" : "Restore"}
                  </button>
                </PermissionGate>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
