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

import { deletePage, schedulePage, setPageHomepage, updatePageStatus } from "./api";
import { PageDeleteConfirm } from "./PageDeleteConfirm";
import { PageForm } from "./PageForm";
import { PageList } from "./PageList";
import { PageRevisionsPanel } from "./PageRevisionsPanel";
import { PageStatusFilter } from "./PageStatusFilter";
import { usePages } from "./hooks/usePages";
import type { CmsPage, CmsPageStatus } from "./types";

/**
 * The Pages admin page (`/admin/pages`, wired via `pages/PagesPage.tsx`
 * — same "feature-owned UI, page file just re-exports it" convention
 * `pages/NewsPage.tsx` established).
 *
 * Gated behind `website.content:read` for the entire page body,
 * matching `PagesController`'s own guard on every GET. Write/publish/
 * revisions/homepage actions are gated again at the control level
 * (`PageRow`, `PageStatusControl`, `PageScheduleControl`,
 * `PageHomepageControl`, `PageRevisionsPanel`), same layered-gating
 * approach `NewsPage` uses.
 *
 * Owns the state tying the child components together: the status/
 * parent filters (fed into `usePages`), which dialog (if any) is open,
 * and which page is mid-status/-schedule/-homepage change. No
 * drag-reorder state, same reasoning as `NewsPage`.
 */
export function PagesPage() {
  const [status, setStatus] = useState<CmsPageStatus | undefined>(undefined);
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const { pages, isLoading, error, refetch, setPages } = usePages(status, parentId);
  const selection = useRowSelection(pages, (page) => page.id);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CmsPage | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CmsPage | null>(null);
  const [historyPage, setHistoryPage] = useState<CmsPage | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [updatingScheduleId, setUpdatingScheduleId] = useState<string | null>(null);
  const [updatingHomepageId, setUpdatingHomepageId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isBulkActionPending, setIsBulkActionPending] = useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);

  const selectedPages = pages.filter((page) => selection.selectedIds.has(page.id));

  function handleCreate() {
    setEditingPage(null);
    setIsFormOpen(true);
  }

  function handleEdit(page: CmsPage) {
    setEditingPage(page);
    setIsFormOpen(true);
  }

  function handleSaved() {
    setIsFormOpen(false);
    setEditingPage(null);
    refetch();
  }

  function handleDeleted() {
    setPendingDelete(null);
    refetch();
  }

  function handleRestored(restored: CmsPage) {
    setPages((current) => current.map((item) => (item.id === restored.id ? restored : item)));
    setHistoryPage(null);
  }

  async function handleChangeStatus(page: CmsPage, nextStatus: CmsPageStatus) {
    setActionError(null);
    setUpdatingStatusId(page.id);

    try {
      const updated = await updatePageStatus(page.id, nextStatus);
      setPages((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleSchedule(page: CmsPage, publishAt: string | null) {
    setActionError(null);
    setUpdatingScheduleId(page.id);

    try {
      const updated = await schedulePage(page.id, { publishAt });
      setPages((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setUpdatingScheduleId(null);
    }
  }

  async function handleSetHomepage(page: CmsPage, isHomepage: boolean) {
    setActionError(null);
    setUpdatingHomepageId(page.id);

    try {
      const updated = await setPageHomepage(page.id, { isHomepage });
      // Setting a new homepage unsets whichever page previously held it
      // server-side (`PagesService.setHomepage`) — patch both the target
      // row and any previous holder in the visible list, rather than
      // just the one row, so the flip is reflected without a refetch.
      setPages((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : isHomepage && item.isHomepage
              ? { ...item, isHomepage: false }
              : item,
        ),
      );
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setUpdatingHomepageId(null);
    }
  }

  /** Shared by `handleBulkPublish`/`handleBulkArchive` — see `NewsPage`'s identical helper for the reasoning. */
  async function runBulkStatusChange(targets: CmsPage[], nextStatus: CmsPageStatus) {
    if (targets.length === 0) return;

    setActionError(null);
    setIsBulkActionPending(true);

    const results = await Promise.allSettled(
      targets.map((page) => updatePageStatus(page.id, nextStatus)),
    );

    const succeededIds: string[] = [];
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        succeededIds.push(targets[index].id);
        const updated = result.value;
        setPages((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      }
    });

    const failedCount = targets.length - succeededIds.length;
    if (failedCount > 0) {
      setActionError(
        `Updated ${succeededIds.length} of ${targets.length} selected page${
          targets.length === 1 ? "" : "s"
        }. ${failedCount} failed — please try again.`,
      );
    }

    selection.deselectIds(succeededIds);
    setIsBulkActionPending(false);
  }

  function handleBulkPublish() {
    void runBulkStatusChange(
      selectedPages.filter((page) => page.status === "draft"),
      "published",
    );
  }

  function handleBulkArchive() {
    void runBulkStatusChange(
      selectedPages.filter((page) => page.status !== "archived"),
      "archived",
    );
  }

  async function handleConfirmBulkDelete() {
    setIsBulkDeleting(true);
    setBulkDeleteError(null);

    const targets = selectedPages;
    const results = await Promise.allSettled(targets.map((page) => deletePage(page.id)));

    const succeededIds: string[] = [];
    results.forEach((result, index) => {
      if (result.status === "fulfilled") succeededIds.push(targets[index].id);
    });

    if (succeededIds.length > 0) {
      setPages((current) => current.filter((item) => !succeededIds.includes(item.id)));
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
      <Breadcrumb items={[{ label: "Dashboard" }, { label: "Pages" }]} />

      <PermissionGate
        permission="website.content:read"
        fallback={
          <>
            <PageHeader title="Pages" />
            <Section>
              <EmptyState
                title="You don't have access to Pages"
                description="Viewing pages requires the Content permission. Contact an admin if you need access."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="Pages"
          description="Manage the site's generic content pages, hierarchy, and homepage."
        >
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={handleCreate}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              New page
            </button>
          </PermissionGate>
        </PageHeader>

        <Section>
          <div className="flex flex-col gap-4">
            <PageStatusFilter
              status={status}
              onStatusChange={setStatus}
              parentId={parentId}
              onParentIdChange={setParentId}
            />

            {actionError ? (
              <p role="alert" className="text-sm text-red-600">
                {actionError}
              </p>
            ) : null}

            <BulkActionToolbar selectedCount={selection.selectedCount} onClear={selection.clear}>
              <BulkPublishArchiveDeleteActions
                selectedStatuses={selectedPages.map((page) => page.status)}
                isProcessing={isBulkActionPending}
                onPublish={handleBulkPublish}
                onArchive={handleBulkArchive}
                onDeleteRequest={() => setIsBulkDeleteConfirmOpen(true)}
              />
            </BulkActionToolbar>

            <PageList
              pages={pages}
              isLoading={isLoading}
              error={error}
              status={status}
              updatingStatusId={updatingStatusId}
              updatingScheduleId={updatingScheduleId}
              updatingHomepageId={updatingHomepageId}
              isSelected={selection.isSelected}
              isAllSelected={selection.isAllSelected}
              isSelectionIndeterminate={selection.isIndeterminate}
              onToggleSelect={selection.toggle}
              onToggleSelectAll={selection.toggleAll}
              onEdit={handleEdit}
              onDeleteRequest={setPendingDelete}
              onChangeStatus={handleChangeStatus}
              onSchedule={handleSchedule}
              onSetHomepage={handleSetHomepage}
              onViewHistory={setHistoryPage}
            />
          </div>
        </Section>

        {isFormOpen ? (
          <PageForm page={editingPage} onCancel={() => setIsFormOpen(false)} onSaved={handleSaved} />
        ) : null}

        {pendingDelete ? (
          <PageDeleteConfirm
            page={pendingDelete}
            onCancel={() => setPendingDelete(null)}
            onDeleted={handleDeleted}
          />
        ) : null}

        {historyPage ? (
          <PageRevisionsPanel
            page={historyPage}
            onClose={() => setHistoryPage(null)}
            onRestored={handleRestored}
          />
        ) : null}

        {isBulkDeleteConfirmOpen ? (
          <BulkDeleteConfirm
            count={selection.selectedCount}
            itemLabel="page"
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
