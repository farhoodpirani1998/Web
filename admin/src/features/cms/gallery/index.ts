/**
 * Public surface of the `cms/gallery` feature.
 *
 * Other layers (pages, other CMS modules) should import from here
 * rather than reaching into `./api`, `./hooks/useGallery`, etc.
 * directly — same convention as `features/cms/faq/index.ts`.
 */
export type {
  CmsGalleryItem,
  CmsGalleryStatus,
  CreateGalleryItemPayload,
  UpdateGalleryItemPayload,
} from "./types";
export {
  fetchGalleryList,
  fetchGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  updateGalleryItemStatus,
  reorderGalleryItems,
} from "./api";
export { useGallery, type UseGalleryResult } from "./hooks/useGallery";

export { GalleryPage } from "./GalleryPage";
export { GalleryGrid, type GalleryGridProps } from "./GalleryGrid";
export { GalleryItemCard, type GalleryItemCardProps } from "./GalleryItemCard";
export { GalleryItemForm, type GalleryItemFormProps } from "./GalleryItemForm";
export { GalleryStatusControl, type GalleryStatusControlProps } from "./GalleryStatusControl";
export { GalleryStatusFilter, type GalleryStatusFilterProps } from "./GalleryStatusFilter";
export { GalleryDeleteConfirm, type GalleryDeleteConfirmProps } from "./GalleryDeleteConfirm";
