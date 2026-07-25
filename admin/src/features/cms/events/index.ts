/**
 * Public surface of the `cms/events` feature.
 *
 * Other layers (pages, other CMS modules) should import from here
 * rather than reaching into `./api`, `./hooks/useEvents`, etc.
 * directly — same convention as `features/cms/news/index.ts`.
 */
export type {
  CmsCalendarEvent,
  CmsEventRevision,
  CmsEventStatus,
  CmsEventSeoMetadata,
  CmsEventSeoMetadataInput,
  CreateCalendarEventPayload,
  ScheduleCalendarEventPayload,
  UpdateCalendarEventPayload,
} from "./types";
export {
  fetchEventsList,
  fetchCalendarEventById,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEventStatus,
  scheduleCalendarEvent,
  fetchEventRevisions,
  restoreEventRevision,
} from "./api";
export { useEvents, type UseEventsResult } from "./hooks/useEvents";

export { EventsPage } from "./EventsPage";
export { EventList, type EventListProps } from "./EventList";
export { EventRow, type EventRowProps } from "./EventRow";
export { EventForm, type EventFormProps } from "./EventForm";
export { EventStatusControl, type EventStatusControlProps } from "./EventStatusControl";
export { EventStatusFilter, type EventStatusFilterProps } from "./EventStatusFilter";
export { EventScheduleControl, type EventScheduleControlProps } from "./EventScheduleControl";
export { EventDeleteConfirm, type EventDeleteConfirmProps } from "./EventDeleteConfirm";
export { EventRevisionsPanel, type EventRevisionsPanelProps } from "./EventRevisionsPanel";
