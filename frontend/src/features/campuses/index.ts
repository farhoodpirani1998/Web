/**
 * Public surface of the `campuses` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import these
 * section components only from here — never from the individual
 * section files directly.
 *
 * Exports the page sections, API functions, query hooks, and their
 * associated public types.
 */
export { HomeCampuses } from "./HomeCampuses";
export { Hero } from "./Hero";
export { CampusList } from "./CampusList";
export { CampusCard, type CampusCardProps } from "./CampusCard";
export { CampusDetails } from "./CampusDetails";
export { FAQ } from "./FAQ";
export { EmptyState } from "./EmptyState";
export type { Campus, CampusContact, CampusImage, PublicCampusDetailDto } from "./types";
export { campuses } from "./data";
export { fetchCampuses, fetchCampusBySlug } from "./api";
export { useCampuses, campusesQueryKey } from "./useCampuses";
export { useCampusBySlug, campusDetailQueryKey } from "./useCampusBySlug";
