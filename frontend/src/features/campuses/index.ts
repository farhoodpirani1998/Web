/**
 * Public surface of the `campuses` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import these
 * section components only from here — never from the individual
 * section files directly.
 *
 * `EmptyState` is exported for future wiring (see its own file's doc
 * comment) but is not composed by `CampusesPage` today.
 *
 * `fetchCampuses`/`useCampuses`/`campusesQueryKey` are additive
 * exports, following the same shape `@/features/news`'s and
 * `@/features/gallery`'s public surfaces already export their fetch
 * layer through.
 */
export { HomeCampuses } from "./HomeCampuses";
export { Hero } from "./Hero";
export { CampusList } from "./CampusList";
export { CampusCard, type CampusCardProps } from "./CampusCard";
export { CampusDetails } from "./CampusDetails";
export { FAQ } from "./FAQ";
export { EmptyState } from "./EmptyState";
export type { Campus, CampusContact, CampusImage } from "./types";
export { campuses } from "./data";
export { fetchCampuses } from "./api";
export { useCampuses, campusesQueryKey } from "./useCampuses";
