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

import { deleteNewsArticle, scheduleNewsArticle, updateNewsArticleStatus } from "./api";
import { NewsDeleteConfirm } from "./NewsDeleteConfirm";
import { NewsForm } from "./NewsForm";
import { NewsList } from "./NewsList";
import { NewsRevisionsPanel } from "./NewsRevisionsPanel";
import { NewsStatusFilter } from "./NewsStatusFilter";
import { useNews } from "./hooks/useNews";
import type { CmsNewsArticle, CmsNewsStatus } from "./types";

/**
 * The News admin page (`/admin/news`, wired via `pages/NewsPage.tsx` —
 * same "feature-owned UI, page file just re-exports it" convention
 * `pages/FaqPage.tsx`/`pages/HeroSlidesPage.tsx` established).
 *
 * Gated behind `website.content:read` for the entire page body,
 * matching `NewsController`'s own `@RequireCmsPermission(CONTENT_READ)`
 * on every GET — a user without it can't view news articles at all,
 * not just edit them. Write/publish/revisions actions are gated again
 * at the control level (`NewsRow`, `NewsStatusControl`,
 * `NewsScheduleControl`, `NewsRevisionsPanel`), same layered-gating
 * approach `FaqPage`/`HeroSlidesPage` use.
 *
 * Owns the state that ties the child components together: the status/
 * category filters (fed into `useNews`), which dialog (if any) is
 * open, which article is mid-status-change or mid-schedule-change, and
 * which article's revision history panel (if any) is open. No
 * drag-reorder state, unlike `FaqPage`/`HeroSlidesPage`/`GalleryPage`
 * — News has no `position`/`reorder` endpoint (see `types.ts`'s top
 * comment).
 */
export function NewsPage() {
  const [status, setStatus] = useState<CmsNewsStatus | undefined>(undefined);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const { articles, isLoading, error, refetch, setArticles } = useNews(status, category);
  const selection = useRowSelection(articles, (article) => article.id);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<CmsNewsArticle | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CmsNewsArticle | null>(null);
  const [historyArticle, setHistoryArticle] = useState<CmsNewsArticle | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [updatingScheduleId, setUpdatingScheduleId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isBulkActionPending, setIsBulkActionPending] = useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);

  const selectedArticles = articles.filter((article) => selection.selectedIds.has(article.id));

  function handleCreate() {
    setEditingArticle(null);
    setIsFormOpen(true);
  }

  function handleEdit(article: CmsNewsArticle) {
    setEditingArticle(article);
    setIsFormOpen(true);
  }

  function handleSaved() {
    setIsFormOpen(false);
    setEditingArticle(null);
    refetch();
  }

  function handleDeleted() {
    setPendingDelete(null);
    refetch();
  }

  function handleRestored(restored: CmsNewsArticle) {
    setArticles((current) => current.map((item) => (item.id === restored.id ? restored : item)));
    setHistoryArticle(null);
  }

  async function handleChangeStatus(article: CmsNewsArticle, nextStatus: CmsNewsStatus) {
    setActionError(null);
    setUpdatingStatusId(article.id);

    try {
      const updated = await updateNewsArticleStatus(article.id, nextStatus);
      setArticles((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleSchedule(article: CmsNewsArticle, publishAt: string | null) {
    setActionError(null);
    setUpdatingScheduleId(article.id);

    try {
      const updated = await scheduleNewsArticle(article.id, { publishAt });
      setArticles((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setUpdatingScheduleId(null);
    }
  }

  /**
   * Shared by `handleBulkPublish`/`handleBulkArchive`: fires
   * `updateNewsArticleStatus` for each target in parallel, applies
   * whichever succeed to `articles`, and drops just those ids from the
   * selection — so a partial failure leaves the failed items checked
   * (for a retry) while the rest disappear from the selection, same as
   * "clear selection after a successful action" for the ids that
   * actually succeeded.
   */
  async function runBulkStatusChange(targets: CmsNewsArticle[], nextStatus: CmsNewsStatus) {
    if (targets.length === 0) return;

    setActionError(null);
    setIsBulkActionPending(true);

    const results = await Promise.allSettled(
      targets.map((article) => updateNewsArticleStatus(article.id, nextStatus)),
    );

    const succeededIds: string[] = [];
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        succeededIds.push(targets[index].id);
        const updated = result.value;
        setArticles((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
      }
    });

    const failedCount = targets.length - succeededIds.length;
    if (failedCount > 0) {
      setActionError(
        `Updated ${succeededIds.length} of ${targets.length} selected article${
          targets.length === 1 ? "" : "s"
        }. ${failedCount} failed — please try again.`,
      );
    }

    selection.deselectIds(succeededIds);
    setIsBulkActionPending(false);
  }

  function handleBulkPublish() {
    void runBulkStatusChange(
      selectedArticles.filter((article) => article.status === "draft"),
      "published",
    );
  }

  function handleBulkArchive() {
    void runBulkStatusChange(
      selectedArticles.filter((article) => article.status !== "archived"),
      "archived",
    );
  }

  async function handleConfirmBulkDelete() {
    setIsBulkDeleting(true);
    setBulkDeleteError(null);

    const targets = selectedArticles;
    const results = await Promise.allSettled(
      targets.map((article) => deleteNewsArticle(article.id)),
    );

    const succeededIds: string[] = [];
    results.forEach((result, index) => {
      if (result.status === "fulfilled") succeededIds.push(targets[index].id);
    });

    if (succeededIds.length > 0) {
      setArticles((current) => current.filter((item) => !succeededIds.includes(item.id)));
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
      <Breadcrumb items={[{ label: "Dashboard" }, { label: "News" }]} />

      <PermissionGate
        permission="website.content:read"
        fallback={
          <>
            <PageHeader title="News" />
            <Section>
              <EmptyState
                title="You don't have access to News"
                description="Viewing news articles requires the Content permission. Contact an admin if you need access."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="News"
          description="Manage the announcements and articles shown on the public site."
        >
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={handleCreate}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              New article
            </button>
          </PermissionGate>
        </PageHeader>

        <Section>
          <div className="flex flex-col gap-4">
            <NewsStatusFilter
              status={status}
              onStatusChange={setStatus}
              category={category}
              onCategoryChange={setCategory}
            />

            {actionError ? (
              <p role="alert" className="text-sm text-red-600">
                {actionError}
              </p>
            ) : null}

            <BulkActionToolbar selectedCount={selection.selectedCount} onClear={selection.clear}>
              <BulkPublishArchiveDeleteActions
                selectedStatuses={selectedArticles.map((article) => article.status)}
                isProcessing={isBulkActionPending}
                onPublish={handleBulkPublish}
                onArchive={handleBulkArchive}
                onDeleteRequest={() => setIsBulkDeleteConfirmOpen(true)}
              />
            </BulkActionToolbar>

            <NewsList
              articles={articles}
              isLoading={isLoading}
              error={error}
              status={status}
              updatingStatusId={updatingStatusId}
              updatingScheduleId={updatingScheduleId}
              isSelected={selection.isSelected}
              isAllSelected={selection.isAllSelected}
              isSelectionIndeterminate={selection.isIndeterminate}
              onToggleSelect={selection.toggle}
              onToggleSelectAll={selection.toggleAll}
              onEdit={handleEdit}
              onDeleteRequest={setPendingDelete}
              onChangeStatus={handleChangeStatus}
              onSchedule={handleSchedule}
              onViewHistory={setHistoryArticle}
            />
          </div>
        </Section>

        {isFormOpen ? (
          <NewsForm
            article={editingArticle}
            onCancel={() => setIsFormOpen(false)}
            onSaved={handleSaved}
          />
        ) : null}

        {pendingDelete ? (
          <NewsDeleteConfirm
            article={pendingDelete}
            onCancel={() => setPendingDelete(null)}
            onDeleted={handleDeleted}
          />
        ) : null}

        {historyArticle ? (
          <NewsRevisionsPanel
            article={historyArticle}
            onClose={() => setHistoryArticle(null)}
            onRestored={handleRestored}
          />
        ) : null}

        {isBulkDeleteConfirmOpen ? (
          <BulkDeleteConfirm
            count={selection.selectedCount}
            itemLabel="news article"
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
