import { useState } from "react";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";
import { ApiError } from "@/lib/apiError";

import { scheduleCalendarEvent, updateCalendarEventStatus } from "./api";
import { EventDeleteConfirm } from "./EventDeleteConfirm";
import { EventForm } from "./EventForm";
import { EventList } from "./EventList";
import { EventRevisionsPanel } from "./EventRevisionsPanel";
import { EventStatusFilter } from "./EventStatusFilter";
import { useEvents } from "./hooks/useEvents";
import type { CmsCalendarEvent, CmsEventStatus } from "./types";

/**
 * The Events admin page (`/admin/events`, wired via
 * `pages/EventsPage.tsx` — same "feature-owned UI, page file just
 * re-exports it" convention `pages/NewsPage.tsx`/`pages/PagesPage.tsx`
 * established).
 *
 * Gated behind `website.content:read` for the entire page body,
 * matching `EventsController`'s own `@RequireCmsPermission(CONTENT_READ)`
 * on every GET — a user without it can't view events at all, not just
 * edit them. Write/publish/revisions actions are gated again at the
 * control level (`EventRow`, `EventStatusControl`,
 * `EventScheduleControl`, `EventRevisionsPanel`), same layered-gating
 * approach `NewsPage`/`PagesPage` use.
 *
 * Owns the state that ties the child components together: the status/
 * category filters (fed into `useEvents`), which dialog (if any) is
 * open, which event is mid-status-change or mid-schedule-change, and
 * which event's revision history panel (if any) is open. No
 * drag-reorder state, unlike `FaqPage`/`HeroSlidesPage`/`GalleryPage`
 * — Events has no `position`/`reorder` endpoint (see `types.ts`'s top
 * comment).
 */
export function EventsPage() {
  const [status, setStatus] = useState<CmsEventStatus | undefined>(undefined);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const { events, isLoading, error, refetch, setEvents } = useEvents(status, category);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CmsCalendarEvent | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CmsCalendarEvent | null>(null);
  const [historyEvent, setHistoryEvent] = useState<CmsCalendarEvent | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [updatingScheduleId, setUpdatingScheduleId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function handleCreate() {
    setEditingEvent(null);
    setIsFormOpen(true);
  }

  function handleEdit(event: CmsCalendarEvent) {
    setEditingEvent(event);
    setIsFormOpen(true);
  }

  function handleSaved() {
    setIsFormOpen(false);
    setEditingEvent(null);
    refetch();
  }

  function handleDeleted() {
    setPendingDelete(null);
    refetch();
  }

  function handleRestored(restored: CmsCalendarEvent) {
    setEvents((current) => current.map((item) => (item.id === restored.id ? restored : item)));
    setHistoryEvent(null);
  }

  async function handleChangeStatus(event: CmsCalendarEvent, nextStatus: CmsEventStatus) {
    setActionError(null);
    setUpdatingStatusId(event.id);

    try {
      const updated = await updateCalendarEventStatus(event.id, nextStatus);
      setEvents((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleSchedule(event: CmsCalendarEvent, publishAt: string | null) {
    setActionError(null);
    setUpdatingScheduleId(event.id);

    try {
      const updated = await scheduleCalendarEvent(event.id, { publishAt });
      setEvents((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setUpdatingScheduleId(null);
    }
  }

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "Dashboard" }, { label: "Events" }]} />

      <PermissionGate
        permission="website.content:read"
        fallback={
          <>
            <PageHeader title="Events" />
            <Section>
              <EmptyState
                title="You don't have access to Events"
                description="Viewing events requires the Content permission. Contact an admin if you need access."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="Events"
          description="Manage the calendar events shown on the public site."
        >
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={handleCreate}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              New event
            </button>
          </PermissionGate>
        </PageHeader>

        <Section>
          <div className="flex flex-col gap-4">
            <EventStatusFilter
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

            <EventList
              events={events}
              isLoading={isLoading}
              error={error}
              updatingStatusId={updatingStatusId}
              updatingScheduleId={updatingScheduleId}
              onEdit={handleEdit}
              onDeleteRequest={setPendingDelete}
              onChangeStatus={handleChangeStatus}
              onSchedule={handleSchedule}
              onViewHistory={setHistoryEvent}
            />
          </div>
        </Section>

        {isFormOpen ? (
          <EventForm
            event={editingEvent}
            onCancel={() => setIsFormOpen(false)}
            onSaved={handleSaved}
          />
        ) : null}

        {pendingDelete ? (
          <EventDeleteConfirm
            event={pendingDelete}
            onCancel={() => setPendingDelete(null)}
            onDeleted={handleDeleted}
          />
        ) : null}

        {historyEvent ? (
          <EventRevisionsPanel
            event={historyEvent}
            onClose={() => setHistoryEvent(null)}
            onRestored={handleRestored}
          />
        ) : null}
      </PermissionGate>
    </PageContainer>
  );
}
