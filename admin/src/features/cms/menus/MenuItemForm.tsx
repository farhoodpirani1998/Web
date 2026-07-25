import { useId, useState, type FormEvent } from "react";

import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { usePageOptions } from "@/features/cms/pages";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";

import { createMenuItem, updateMenuItem } from "./api";
import type { CmsMenuItem, CmsMenuItemLinkType } from "./types";

/**
 * Create/edit dialog for `POST /admin/menu-items` and
 * `PATCH /admin/menu-items/:id`. Same plain fixed-overlay modal shape
 * as `features/cms/portal-links/PortalLinkForm.tsx`.
 *
 * `label.fa` is the only required translatable field, matching
 * `CreateMenuItemDto`'s nested `TranslatableTextDto` (`fa` mandatory,
 * `en` optional). Exactly one of `pageId`/`url` is sent, matching
 * `linkType` — the same invariant `MenuItemsService.assertValidLink`
 * enforces server-side; switching `linkType` here clears the other
 * field's value rather than sending both.
 *
 * The page picker (`usePageOptions`) reuses the Pages module's own
 * "full unfiltered list for a `<select>`" hook rather than duplicating
 * a fetch — same cross-module reuse the Pages module's own parent
 * picker already relies on internally.
 *
 * `parentId` options are every other item in the same menu, flat
 * (excluding this item itself in edit mode) — the backend
 * (`MenuItemsService.assertValidParent`) is the source of truth for
 * "same menu" and "no cycle"; this list isn't filtered further to
 * avoid re-implementing that walk on the client.
 */
export interface MenuItemFormProps {
  menuId: string;
  /** Flat list of every item already in this menu, for the parent picker. */
  siblingCandidates: CmsMenuItem[];
  /** `null` for create mode; an existing item for edit mode. */
  item: CmsMenuItem | null;
  /** Pre-selected parent when creating a child from a specific row's "Add child" action. */
  defaultParentId?: string;
  onCancel: () => void;
  onSaved: (item: CmsMenuItem) => void;
}

export function MenuItemForm({
  menuId,
  siblingCandidates,
  item,
  defaultParentId,
  onCancel,
  onSaved,
}: MenuItemFormProps) {
  const isEdit = item !== null;

  const labelFaId = useId();
  const labelEnId = useId();
  const linkTypeId = useId();
  const pageId = useId();
  const urlId = useId();
  const parentId = useId();
  const visibleId = useId();

  const { options: pageOptions, isLoading: isLoadingPages } = usePageOptions();

  const [labelFa, setLabelFa] = useState(item?.label.fa ?? "");
  const [labelEn, setLabelEn] = useState(item?.label.en ?? "");
  const [linkType, setLinkType] = useState<CmsMenuItemLinkType>(item?.linkType ?? "page");
  const [selectedPageId, setSelectedPageId] = useState(item?.pageId ?? "");
  const [url, setUrl] = useState(item?.url ?? "");
  const [selectedParentId, setSelectedParentId] = useState(
    item?.parentId ?? defaultParentId ?? "",
  );
  const [visible, setVisible] = useState(item?.visible ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isDirty } = useIsDirty({
    labelFa,
    labelEn,
    linkType,
    selectedPageId,
    url,
    selectedParentId,
    visible,
  });
  const { isConfirmOpen, guardedAction, confirmLeave, cancelLeave } =
    useUnsavedChangesGuard(isDirty);

  const parentOptions = siblingCandidates.filter((candidate) => candidate.id !== item?.id);

  const canSubmit =
    labelFa.trim().length > 0 &&
    (linkType === "page" ? selectedPageId.length > 0 : url.trim().length > 0) &&
    !isSaving;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setIsSaving(true);

    const trimmedLabelEn = labelEn.trim();
    const label = {
      fa: labelFa.trim(),
      ...(trimmedLabelEn ? { en: trimmedLabelEn } : {}),
    };

    try {
      const saved = isEdit
        ? await updateMenuItem(item.id, {
            label,
            linkType,
            pageId: linkType === "page" ? selectedPageId : null,
            url: linkType === "external" ? url.trim() : null,
            parentId: selectedParentId ? selectedParentId : null,
            visible,
          })
        : await createMenuItem({
            menuId,
            parentId: selectedParentId ? selectedParentId : undefined,
            label,
            linkType,
            pageId: linkType === "page" ? selectedPageId : undefined,
            url: linkType === "external" ? url.trim() : undefined,
            visible,
          });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {isEdit ? "Edit menu item" : "New menu item"}
        </h2>

        <form
          className="mt-4 flex max-h-[70vh] flex-col gap-4 overflow-y-auto"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor={labelFaId} className="text-sm font-medium text-slate-900">
              Label (Farsi)
            </label>
            <input
              id={labelFaId}
              type="text"
              dir="rtl"
              required
              value={labelFa}
              onChange={(event) => setLabelFa(event.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={labelEnId} className="text-sm font-medium text-slate-900">
              Label (English) <span className="font-normal text-slate-400">— optional</span>
            </label>
            <input
              id={labelEnId}
              type="text"
              value={labelEn}
              onChange={(event) => setLabelEn(event.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={linkTypeId} className="text-sm font-medium text-slate-900">
              Link type
            </label>
            <select
              id={linkTypeId}
              value={linkType}
              onChange={(event) => setLinkType(event.target.value as CmsMenuItemLinkType)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            >
              <option value="page">Static page</option>
              <option value="external">External URL</option>
            </select>
          </div>

          {linkType === "page" ? (
            <div className="flex flex-col gap-1.5">
              <label htmlFor={pageId} className="text-sm font-medium text-slate-900">
                Page
              </label>
              <select
                id={pageId}
                required
                value={selectedPageId}
                onChange={(event) => setSelectedPageId(event.target.value)}
                disabled={isSaving || isLoadingPages}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              >
                <option value="" disabled>
                  {isLoadingPages ? "Loading pages…" : "Select a page"}
                </option>
                {pageOptions.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.title.fa} ({page.slug})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label htmlFor={urlId} className="text-sm font-medium text-slate-900">
                URL
              </label>
              <input
                id={urlId}
                type="text"
                required
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                disabled={isSaving}
                placeholder="https://example.com or mailto:info@example.com"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor={parentId} className="text-sm font-medium text-slate-900">
              Parent item <span className="font-normal text-slate-400">— optional</span>
            </label>
            <select
              id={parentId}
              value={selectedParentId}
              onChange={(event) => setSelectedParentId(event.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            >
              <option value="">None — top-level item</option>
              {parentOptions.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.label.fa}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              id={visibleId}
              type="checkbox"
              checked={visible}
              onChange={(event) => setVisible(event.target.checked)}
              disabled={isSaving}
              className="h-4 w-4 rounded border-slate-300"
            />
            <label htmlFor={visibleId} className="text-sm font-medium text-slate-900">
              Visible in the live navigation
            </label>
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
              {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create item"}
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
