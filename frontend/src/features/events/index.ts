/**
 * Public surface of the `events` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import these
 * section components only from here — never from the individual
 * section files directly.
 *
 * `EmptyState` is exported for future wiring (see its own file's doc
 * comment) but is not composed by `EventsPage` today.
 */
export { Hero } from "./Hero";
export { EventList } from "./EventList";
export { EventCard, type EventCardProps } from "./EventCard";
export { EventDetails } from "./EventDetails";
export { FAQ } from "./FAQ";
export { EmptyState } from "./EmptyState";
export type { Event, EventImage } from "./types";
export { events } from "./data";
export { fetchEvents } from "./api";
export { useEvents, eventsQueryKey } from "./useEvents";
