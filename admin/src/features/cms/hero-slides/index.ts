/**
 * Public surface of the `cms/hero-slides` feature.
 *
 * Other layers (pages, other CMS modules) should import from here
 * rather than reaching into `./api`, `./hooks/useHeroSlides`, etc.
 * directly — same convention as `features/cms/gallery/index.ts`.
 */
export type {
  CmsHeroSlide,
  CmsHeroSlideRevision,
  CmsHeroSlideStatus,
  CreateHeroSlidePayload,
  UpdateHeroSlidePayload,
} from "./types";
export {
  fetchHeroSlideList,
  fetchHeroSlideById,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  updateHeroSlideStatus,
  reorderHeroSlides,
  fetchHeroSlideRevisions,
  restoreHeroSlideRevision,
} from "./api";
export { useHeroSlides, type UseHeroSlidesResult } from "./hooks/useHeroSlides";

export { HeroSlidesPage } from "./HeroSlidesPage";
export { HeroSlideList, type HeroSlideListProps } from "./HeroSlideList";
export { HeroSlideRow, type HeroSlideRowProps } from "./HeroSlideRow";
export { HeroSlideForm, type HeroSlideFormProps } from "./HeroSlideForm";
export {
  HeroSlideStatusControl,
  type HeroSlideStatusControlProps,
} from "./HeroSlideStatusControl";
export { HeroSlideStatusFilter, type HeroSlideStatusFilterProps } from "./HeroSlideStatusFilter";
export {
  HeroSlideDeleteConfirm,
  type HeroSlideDeleteConfirmProps,
} from "./HeroSlideDeleteConfirm";
export {
  HeroSlideRevisionsPanel,
  type HeroSlideRevisionsPanelProps,
} from "./HeroSlideRevisionsPanel";
