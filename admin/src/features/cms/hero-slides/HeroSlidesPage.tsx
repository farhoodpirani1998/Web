import { useState } from "react";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";
import { ApiError } from "@/lib/apiError";

import { reorderHeroSlides, updateHeroSlideStatus } from "./api";
import { HeroSlideDeleteConfirm } from "./HeroSlideDeleteConfirm";
import { HeroSlideForm } from "./HeroSlideForm";
import { HeroSlideList } from "./HeroSlideList";
import { HeroSlideRevisionsPanel } from "./HeroSlideRevisionsPanel";
import { HeroSlideStatusFilter } from "./HeroSlideStatusFilter";
import { useHeroSlides } from "./hooks/useHeroSlides";
import type { CmsHeroSlide, CmsHeroSlideStatus } from "./types";

/**
 * The Hero Slides admin page (`/admin/hero-slides`, wired via
 * `pages/HeroSlidesPage.tsx` — same "feature-owned UI, page file just
 * re-exports it" convention `pages/FaqPage.tsx`/`pages/GalleryPage.tsx`
 * established).
 *
 * Gated behind `website.content:read` for the entire page body,
 * matching `HeroController`'s own `@RequireCmsPermission(CONTENT_READ)`
 * on every GET — a user without it can't view hero slides at all, not
 * just edit them. Write/publish/revisions actions are gated again at
 * the control level (`HeroSlideRow`, `HeroSlideStatusControl`,
 * `HeroSlideRevisionsPanel`), same layered-gating approach
 * `CampusesPage`/`TeachersPage` use.
 *
 * Owns the state that ties the child components together: the status
 * filter (fed into `useHeroSlides`), which dialog (if any) is open,
 * which slide is mid-status-change, whether a reorder is in flight,
 * and which slide's revision history panel (if any) is open.
 */
export function HeroSlidesPage() {
  const [status, setStatus] = useState<CmsHeroSlideStatus | undefined>(undefined);
  const { slides, isLoading, error, refetch, setSlides } = useHeroSlides(status);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<CmsHeroSlide | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CmsHeroSlide | null>(null);
  const [historySlide, setHistorySlide] = useState<CmsHeroSlide | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  function handleCreate() {
    setEditingSlide(null);
    setIsFormOpen(true);
  }

  function handleEdit(slide: CmsHeroSlide) {
    setEditingSlide(slide);
    setIsFormOpen(true);
  }

  function handleSaved() {
    setIsFormOpen(false);
    setEditingSlide(null);
    refetch();
  }

  function handleDeleted() {
    setPendingDelete(null);
    refetch();
  }

  function handleRestored(restored: CmsHeroSlide) {
    setSlides((current) => current.map((row) => (row.id === restored.id ? restored : row)));
    setHistorySlide(null);
  }

  async function handleChangeStatus(slide: CmsHeroSlide, nextStatus: CmsHeroSlideStatus) {
    setActionError(null);
    setUpdatingStatusId(slide.id);

    try {
      const updated = await updateHeroSlideStatus(slide.id, nextStatus);
      setSlides((current) => current.map((row) => (row.id === updated.id ? updated : row)));
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleReorder(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= slides.length) return;

    const reordered = [...slides];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    // Optimistic: update the visible order immediately and roll back on
    // failure. `PATCH /hero-slides/reorder` returns void
    // (`HeroService.reorder`), so there's no response body to
    // reconcile against — only whether the call succeeded.
    const previous = slides;
    setSlides(reordered);
    setActionError(null);
    setIsReordering(true);

    try {
      await reorderHeroSlides(reordered.map((row) => row.id));
    } catch (err) {
      setSlides(previous);
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setIsReordering(false);
    }
  }

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "Dashboard" }, { label: "Hero Slides" }]} />

      <PermissionGate
        permission="website.content:read"
        fallback={
          <>
            <PageHeader title="Hero Slides" />
            <Section>
              <EmptyState
                title="You don't have access to hero slides"
                description="Viewing hero slides requires the Content permission. Contact an admin if you need access."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="Hero Slides"
          description="Manage the slides shown in the homepage hero carousel."
        >
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={handleCreate}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              New hero slide
            </button>
          </PermissionGate>
        </PageHeader>

        <Section>
          <div className="flex flex-col gap-4">
            <HeroSlideStatusFilter value={status} onChange={setStatus} />

            {actionError ? (
              <p role="alert" className="text-sm text-red-600">
                {actionError}
              </p>
            ) : null}

            <HeroSlideList
              slides={slides}
              isLoading={isLoading}
              error={error}
              status={status}
              updatingStatusId={updatingStatusId}
              isReordering={isReordering}
              onEdit={handleEdit}
              onDeleteRequest={setPendingDelete}
              onChangeStatus={handleChangeStatus}
              onViewHistory={setHistorySlide}
              onReorder={handleReorder}
            />
          </div>
        </Section>

        {isFormOpen ? (
          <HeroSlideForm
            slide={editingSlide}
            onCancel={() => setIsFormOpen(false)}
            onSaved={handleSaved}
          />
        ) : null}

        {pendingDelete ? (
          <HeroSlideDeleteConfirm
            slide={pendingDelete}
            onCancel={() => setPendingDelete(null)}
            onDeleted={handleDeleted}
          />
        ) : null}

        {historySlide ? (
          <HeroSlideRevisionsPanel
            slide={historySlide}
            onClose={() => setHistorySlide(null)}
            onRestored={handleRestored}
          />
        ) : null}
      </PermissionGate>
    </PageContainer>
  );
}
