import { useState } from "react";

import { BulkActionToolbar } from "@/components/ui/BulkActionToolbar";
import { BulkDeleteConfirm } from "@/components/ui/BulkDeleteConfirm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";
import { BulkPublishArchiveDeleteActions } from "@/features/cms/components/BulkPublishArchiveDeleteActions";
import { useRowSelection } from "@/hooks/useRowSelection";
import { ApiError } from "@/lib/apiError";

import { deleteTestimonial, reorderTestimonials, updateTestimonialStatus } from "./api";
import { TestimonialDeleteConfirm } from "./TestimonialDeleteConfirm";
import { TestimonialForm } from "./TestimonialForm";
import { TestimonialList } from "./TestimonialList";
import { TestimonialStatusFilter } from "./TestimonialStatusFilter";
import { useTestimonials } from "./hooks/useTestimonials";
import type { CmsTestimonial, CmsTestimonialStatus } from "./types";

/**
 * The Testimonials admin page (`/admin/testimonials`, wired via
 * `pages/TestimonialsPage.tsx` — same "feature-owned UI, page file
 * just re-exports it" convention `pages/FaqPage.tsx` established for
 * FAQ).
 *
 * Gated behind `website.content:read` for the entire page body,
 * matching `TestimonialsController`'s own
 * `@RequireCmsPermission(CONTENT_READ)` on every GET — a user without
 * it can't view testimonials at all, not just edit them. Write/publish
 * actions are gated again at the control level (`TestimonialRow`,
 * `TestimonialStatusControl`), same layered-gating approach `FaqPage`
 * uses.
 *
 * Owns the state that ties the child components together: the status
 * filter (fed into `useTestimonials`), which dialog (if any) is open,
 * which testimonial is mid-status-change, and whether a reorder is in
 * flight. Structurally identical to `FaqPage` — Testimonials shares
 * the same ordered-list-with-publishing-lifecycle shape as FAQ.
 */
export function TestimonialsPage() {
  const [status, setStatus] = useState<CmsTestimonialStatus | undefined>(undefined);
  const { testimonials, isLoading, error, refetch, setTestimonials } = useTestimonials(status);
  const selection = useRowSelection(testimonials, (testimonial) => testimonial.id);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<CmsTestimonial | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CmsTestimonial | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isBulkActionPending, setIsBulkActionPending] = useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);

  const selectedTestimonials = testimonials.filter((testimonial) =>
    selection.selectedIds.has(testimonial.id),
  );

  function handleCreate() {
    setEditingTestimonial(null);
    setIsFormOpen(true);
  }

  function handleEdit(testimonial: CmsTestimonial) {
    setEditingTestimonial(testimonial);
    setIsFormOpen(true);
  }

  function handleSaved() {
    setIsFormOpen(false);
    setEditingTestimonial(null);
    refetch();
  }

  function handleDeleted() {
    setPendingDelete(null);
    refetch();
  }

  async function handleChangeStatus(testimonial: CmsTestimonial, nextStatus: CmsTestimonialStatus) {
    setActionError(null);
    setUpdatingStatusId(testimonial.id);

    try {
      const updated = await updateTestimonialStatus(testimonial.id, nextStatus);
      setTestimonials((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleReorder(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= testimonials.length) return;

    const reordered = [...testimonials];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    // Optimistic: update the visible order immediately and roll back
    // on failure. `PATCH /testimonials/reorder` returns void
    // (`TestimonialsService.reorder`), so there's no response body to
    // reconcile against — only whether the call succeeded.
    const previous = testimonials;
    setTestimonials(reordered);
    setActionError(null);
    setIsReordering(true);

    try {
      await reorderTestimonials(reordered.map((item) => item.id));
    } catch (err) {
      setTestimonials(previous);
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setIsReordering(false);
    }
  }

  /** Shared by `handleBulkPublish`/`handleBulkArchive` — see `NewsPage`'s identical helper for the reasoning. */
  async function runBulkStatusChange(targets: CmsTestimonial[], nextStatus: CmsTestimonialStatus) {
    if (targets.length === 0) return;

    setActionError(null);
    setIsBulkActionPending(true);

    const results = await Promise.allSettled(
      targets.map((testimonial) => updateTestimonialStatus(testimonial.id, nextStatus)),
    );

    const succeededIds: string[] = [];
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        succeededIds.push(targets[index].id);
        const updated = result.value;
        setTestimonials((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
      }
    });

    const failedCount = targets.length - succeededIds.length;
    if (failedCount > 0) {
      setActionError(
        `Updated ${succeededIds.length} of ${targets.length} selected testimonial${
          targets.length === 1 ? "" : "s"
        }. ${failedCount} failed — please try again.`,
      );
    }

    selection.deselectIds(succeededIds);
    setIsBulkActionPending(false);
  }

  function handleBulkPublish() {
    void runBulkStatusChange(
      selectedTestimonials.filter((testimonial) => testimonial.status === "draft"),
      "published",
    );
  }

  function handleBulkArchive() {
    void runBulkStatusChange(
      selectedTestimonials.filter((testimonial) => testimonial.status !== "archived"),
      "archived",
    );
  }

  async function handleConfirmBulkDelete() {
    setIsBulkDeleting(true);
    setBulkDeleteError(null);

    const targets = selectedTestimonials;
    const results = await Promise.allSettled(
      targets.map((testimonial) => deleteTestimonial(testimonial.id)),
    );

    const succeededIds: string[] = [];
    results.forEach((result, index) => {
      if (result.status === "fulfilled") succeededIds.push(targets[index].id);
    });

    if (succeededIds.length > 0) {
      setTestimonials((current) => current.filter((item) => !succeededIds.includes(item.id)));
      selection.deselectIds(succeededIds);
    }

    const failedCount = targets.length - succeededIds.length;
    setIsBulkDeleting(false);

    if (failedCount > 0) {
      setBulkDeleteError(
        `Deleted ${succeededIds.length} of ${targets.length}. ${failedCount} failed — please try again.`,
      );
    } else {
      setIsBulkDeleteConfirmOpen(false);
    }
  }

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "Dashboard" }, { label: "Testimonials" }]} />

      <PermissionGate
        permission="website.content:read"
        fallback={
          <>
            <PageHeader title="Testimonials" />
            <Section>
              <EmptyState
                title="You don't have access to Testimonials"
                description="Viewing testimonials requires the Content permission. Contact an admin if you need access."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="Testimonials"
          description="Manage the parent, student, and staff quotes shown on the public site."
        >
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={handleCreate}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              New testimonial
            </button>
          </PermissionGate>
        </PageHeader>

        <Section>
          <div className="flex flex-col gap-4">
            <TestimonialStatusFilter value={status} onChange={setStatus} />

            {actionError ? (
              <p role="alert" className="text-sm text-red-600">
                {actionError}
              </p>
            ) : null}

            <BulkActionToolbar selectedCount={selection.selectedCount} onClear={selection.clear}>
              <BulkPublishArchiveDeleteActions
                selectedStatuses={selectedTestimonials.map((testimonial) => testimonial.status)}
                isProcessing={isBulkActionPending}
                onPublish={handleBulkPublish}
                onArchive={handleBulkArchive}
                onDeleteRequest={() => setIsBulkDeleteConfirmOpen(true)}
              />
            </BulkActionToolbar>

            <TestimonialList
              testimonials={testimonials}
              isLoading={isLoading}
              error={error}
              status={status}
              updatingStatusId={updatingStatusId}
              isReordering={isReordering}
              isSelected={selection.isSelected}
              isAllSelected={selection.isAllSelected}
              isSelectionIndeterminate={selection.isIndeterminate}
              onToggleSelect={selection.toggle}
              onToggleSelectAll={selection.toggleAll}
              onEdit={handleEdit}
              onDeleteRequest={setPendingDelete}
              onChangeStatus={handleChangeStatus}
              onReorder={handleReorder}
            />
          </div>
        </Section>

        {isFormOpen ? (
          <TestimonialForm
            testimonial={editingTestimonial}
            onCancel={() => setIsFormOpen(false)}
            onSaved={handleSaved}
          />
        ) : null}

        {pendingDelete ? (
          <TestimonialDeleteConfirm
            testimonial={pendingDelete}
            onCancel={() => setPendingDelete(null)}
            onDeleted={handleDeleted}
          />
        ) : null}

        {isBulkDeleteConfirmOpen ? (
          <BulkDeleteConfirm
            count={selection.selectedCount}
            itemLabel="testimonial"
            isDeleting={isBulkDeleting}
            error={bulkDeleteError}
            onCancel={() => {
              setIsBulkDeleteConfirmOpen(false);
              setBulkDeleteError(null);
            }}
            onConfirm={() => void handleConfirmBulkDelete()}
          />
        ) : null}
      </PermissionGate>
    </PageContainer>
  );
}
