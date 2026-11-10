/**
 * Public surface of the `events` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import these
 * section components only from here — never from the individual
 * section files directly.
 *
 * Exports the page sections, API functions, query hooks, and their
 * associated public types.
 */
export { Hero } from "./Hero";
export { EventList } from "./EventList";
export { EventCard, type EventCardProps } from "./EventCard";
export { EventDetails } from "./EventDetails";
export { FAQ } from "./FAQ";
export { EmptyState } from "./EmptyState";
export type { Event, EventImage, PublicEventDetailDto } from "./types";
export { events } from "./data";
export { fetchEvents, fetchEventBySlug } from "./api";
export { useEvents, eventsQueryKey } from "./useEvents";
export { useEventBySlug, eventDetailQueryKey } from "./useEventBySlug";
