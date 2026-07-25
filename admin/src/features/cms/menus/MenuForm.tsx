import { useId, useState, type FormEvent } from "react";

import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";

import { createMenu, updateMenu } from "./api";
import type { CmsMenu } from "./types";

/**
 * Create/edit dialog for `POST /admin/menus` and `PATCH /admin/menus/:id`.
 * Same plain fixed-overlay modal shape as
 * `features/cms/portal-links/PortalLinkForm.tsx`.
 *
 * `key` and `name` are the only fields, matching `CreateMenuDto`/
 * `UpdateMenuDto`. `key` must be lowercase kebab-case
 * (`MenusService`'s own `KEY_PATTERN`) — enforced here too so a bad
 * value is caught before the round-trip, with the same error surfaced
 * from the backend as a fallback for anything this pattern misses.
 */
export interface MenuFormProps {
  /** `null` for create mode; an existing menu for edit mode. */
  menu: CmsMenu | null;
  onCancel: () => void;
  onSaved: (menu: CmsMenu) => void;
}

const KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function MenuForm({ menu, onCancel, onSaved }: MenuFormProps) {
  const isEdit = menu !== null;

  const keyId = useId();
  const nameId = useId();

  const [key, setKey] = useState(menu?.key ?? "");
  const [name, setName] = useState(menu?.name ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isDirty } = useIsDirty({ key, name });
  const { isConfirmOpen, guardedAction, confirmLeave, cancelLeave } =
    useUnsavedChangesGuard(isDirty);

  const trimmedKey = key.trim();
  const canSubmit =
    trimmedKey.length > 0 && KEY_PATTERN.test(trimmedKey) && name.trim().length > 0 && !isSaving;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setIsSaving(true);

    const payload = { key: trimmedKey, name: name.trim() };

    try {
      const saved = isEdit ? await updateMenu(menu.id, payload) : await createMenu(payload);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {isEdit ? "Edit menu" : "New menu"}
        </h2>

        <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={keyId} className="text-sm font-medium text-slate-900">
              Key
            </label>
            <input
              id={keyId}
              type="text"
              required
              value={key}
              onChange={(event) => setKey(event.target.value)}
              disabled={isSaving}
              placeholder="e.g. header"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
            <p className="text-xs text-slate-500">
              Lowercase kebab-case — the id the frontend requests this menu by (e.g. "header",
              "footer-secondary").
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={nameId} className="text-sm font-medium text-slate-900">
              Name
            </label>
            <input
              id={nameId}
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isSaving}
              placeholder="e.g. Header Navigation"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
            <p className="text-xs text-slate-500">Admin-facing label only — not shown on the public site.</p>
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create menu"}
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
