import { useState } from "react";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";
import { ApiError } from "@/lib/apiError";

import { reorderPortalLinks, updatePortalLink } from "./api";
import { PortalLinkDeleteConfirm } from "./PortalLinkDeleteConfirm";
import { PortalLinkForm } from "./PortalLinkForm";
import { PortalLinkList } from "./PortalLinkList";
import { usePortalLinks } from "./hooks/usePortalLinks";
import type { CmsPortalLink } from "./types";

/**
 * The Portal Links admin page (`/admin/portal-links`, wired via
 * `pages/PortalLinksPage.tsx` — same "feature-owned UI, page file just
 * re-exports it" convention `pages/MediaPage.tsx`/`pages/FaqPage.tsx`
 * established for Media/FAQ).
 *
 * Gated behind `website.content:read` for the entire page body,
 * matching `PortalLinksController`'s own
 * `@RequireCmsPermission(CONTENT_READ)` on every GET. Write actions are
 * gated again at the control level (`PortalLinkRow`), same layered-
 * gating approach `FaqPage`/`MediaPage` use.
 *
 * Owns the state that ties the child components together: which
 * dialog (if any) is open, which link is mid-visibility-toggle, and
 * whether a reorder is in flight. No status filter (unlike `FaqPage`)
 * — Portal Links has no draft/published/archived lifecycle, see
 * `types.ts`.
 */
export function PortalLinksPage() {
  const { links, isLoading, error, refetch, setLinks } = usePortalLinks();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<CmsPortalLink | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CmsPortalLink | null>(null);
  const [togglingVisibleId, setTogglingVisibleId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  function handleCreate() {
    setEditingLink(null);
    setIsFormOpen(true);
  }

  function handleEdit(link: CmsPortalLink) {
    setEditingLink(link);
    setIsFormOpen(true);
  }

  function handleSaved() {
    setIsFormOpen(false);
    setEditingLink(null);
    refetch();
  }

  function handleDeleted() {
    setPendingDelete(null);
    refetch();
  }

  async function handleToggleVisible(link: CmsPortalLink) {
    setActionError(null);
    setTogglingVisibleId(link.id);

    try {
      const updated = await updatePortalLink(link.id, { visible: !link.visible });
      setLinks((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setTogglingVisibleId(null);
    }
  }

  async function handleReorder(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= links.length) return;

    const reordered = [...links];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    // Optimistic: update the visible order immediately and roll back
    // on failure — same reasoning as `FaqPage.handleReorder`.
    const previous = links;
    setLinks(reordered);
    setActionError(null);
    setIsReordering(true);

    try {
      await reorderPortalLinks(reordered.map((item) => item.id));
    } catch (err) {
      setLinks(previous);
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setIsReordering(false);
    }
  }

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "Dashboard" }, { label: "Portal Links" }]} />

      <PermissionGate
        permission="website.content:read"
        fallback={
          <>
            <PageHeader title="Portal Links" />
            <Section>
              <EmptyState
                title="You don't have access to Portal Links"
                description="Viewing portal links requires the Content permission. Contact an admin if you need access."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="Portal Links"
          description="Manage links out to external systems (parent portal, LMS, webmail, etc.)."
        >
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={handleCreate}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              New link
            </button>
          </PermissionGate>
        </PageHeader>

        <Section>
          <div className="flex flex-col gap-4">
            {actionError ? (
              <p role="alert" className="text-sm text-red-600">
                {actionError}
              </p>
            ) : null}

            <PortalLinkList
              links={links}
              isLoading={isLoading}
              error={error}
              isReordering={isReordering}
              togglingVisibleId={togglingVisibleId}
              onEdit={handleEdit}
              onDeleteRequest={setPendingDelete}
              onToggleVisible={handleToggleVisible}
              onReorder={handleReorder}
            />
          </div>
        </Section>

        {isFormOpen ? (
          <PortalLinkForm
            link={editingLink}
            onCancel={() => setIsFormOpen(false)}
            onSaved={handleSaved}
          />
        ) : null}

        {pendingDelete ? (
          <PortalLinkDeleteConfirm
            link={pendingDelete}
            onCancel={() => setPendingDelete(null)}
            onDeleted={handleDeleted}
          />
        ) : null}
      </PermissionGate>
    </PageContainer>
  );
}
