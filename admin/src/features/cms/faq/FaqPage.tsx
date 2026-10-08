import { useState } from "react";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";
import { ApiError } from "@/lib/apiError";

import { reorderFaqs, updateFaqStatus } from "./api";
import { FaqDeleteConfirm } from "./FaqDeleteConfirm";
import { FaqForm } from "./FaqForm";
import { FaqList } from "./FaqList";
import { FaqStatusFilter } from "./FaqStatusFilter";
import { useFaqs } from "./hooks/useFaqs";
import type { CmsFaq, CmsFaqStatus } from "./types";

/**
 * The FAQ admin page (`/admin/faqs`, wired via `pages/FaqPage.tsx` —
 * same "feature-owned UI, page file just re-exports it" convention
 * `pages/MediaPage.tsx` established for Media).
 *
 * Gated behind `website.content:read` for the entire page body,
 * matching `FaqController`'s own `@RequireCmsPermission(CONTENT_READ)`
 * on every GET — a user without it can't view FAQs at all, not just
 * edit them. Write/publish actions are gated again at the control
 * level (`FaqRow`, `FaqStatusControl`), same layered-gating approach
 * `MediaPage`/`MediaCard` use.
 *
 * Owns the state that ties the child components together: the status
 * filter (fed into `useFaqs`), which dialog (if any) is open, which
 * FAQ is mid-status-change, and whether a reorder is in flight.
 */
export function FaqPage() {
  const [status, setStatus] = useState<CmsFaqStatus | undefined>(undefined);
  const { faqs, isLoading, error, refetch, setFaqs } = useFaqs(status);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<CmsFaq | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CmsFaq | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  function handleCreate() {
    setEditingFaq(null);
    setIsFormOpen(true);
  }

  function handleEdit(faq: CmsFaq) {
    setEditingFaq(faq);
    setIsFormOpen(true);
  }

  function handleSaved() {
    setIsFormOpen(false);
    setEditingFaq(null);
    refetch();
  }

  function handleDeleted() {
    setPendingDelete(null);
    refetch();
  }

  async function handleChangeStatus(faq: CmsFaq, nextStatus: CmsFaqStatus) {
    setActionError(null);
    setUpdatingStatusId(faq.id);

    try {
      const updated = await updateFaqStatus(faq.id, nextStatus);
      setFaqs((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleReorder(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= faqs.length) return;

    const reordered = [...faqs];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    // Optimistic: update the visible order immediately and roll back on
    // failure. `PATCH /faqs/reorder` returns void (`FaqService.reorder`),
    // so there's no response body to reconcile against — only whether
    // the call succeeded.
    const previous = faqs;
    setFaqs(reordered);
    setActionError(null);
    setIsReordering(true);

    try {
      await reorderFaqs(reordered.map((item) => item.id));
    } catch (err) {
      setFaqs(previous);
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setIsReordering(false);
    }
  }

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "Dashboard" }, { label: "FAQ" }]} />

      <PermissionGate
        permission="website.content:read"
        fallback={
          <>
            <PageHeader title="FAQ" />
            <Section>
              <EmptyState
                title="You don't have access to FAQ"
                description="Viewing FAQs requires the Content permission. Contact an admin if you need access."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="FAQ"
          description="Manage the questions and answers shown on the public site."
        >
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={handleCreate}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              New FAQ
            </button>
          </PermissionGate>
        </PageHeader>

        <Section>
          <div className="flex flex-col gap-4">
            <FaqStatusFilter value={status} onChange={setStatus} />

            {actionError ? (
              <p role="alert" className="text-sm text-red-600">
                {actionError}
              </p>
            ) : null}

            <FaqList
              faqs={faqs}
              isLoading={isLoading}
              error={error}
              status={status}
              updatingStatusId={updatingStatusId}
              isReordering={isReordering}
              onEdit={handleEdit}
              onDeleteRequest={setPendingDelete}
              onChangeStatus={handleChangeStatus}
              onReorder={handleReorder}
            />
          </div>
        </Section>

        {isFormOpen ? (
          <FaqForm faq={editingFaq} onCancel={() => setIsFormOpen(false)} onSaved={handleSaved} />
        ) : null}

        {pendingDelete ? (
          <FaqDeleteConfirm
            faq={pendingDelete}
            onCancel={() => setPendingDelete(null)}
            onDeleted={handleDeleted}
          />
        ) : null}
      </PermissionGate>
    </PageContainer>
  );
}
