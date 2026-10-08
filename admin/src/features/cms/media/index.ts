/**
 * Public surface of the `cms/media` feature.
 *
 * Other layers (pages, other CMS modules) should import from here
 * rather than reaching into `./api`, `./mediaCache`, etc. directly —
 * same convention as `features/auth/index.ts`.
 *
 * `mediaCache.ts`'s functions are intentionally NOT re-exported: they're
 * an implementation detail of `useMediaById`/`useMediaList`, not a
 * surface other modules should read or write directly.
 */
export type { CmsMedia, CmsMediaStatus, CmsMediaUsage, UploadMediaPayload } from "./types";
export {
  fetchMediaList,
  fetchMediaById,
  fetchMediaUsage,
  uploadMedia,
  archiveMedia,
  deleteMedia,
} from "./api";
export { useMediaById, type UseMediaByIdResult } from "./useMediaById";
export { useMediaList, type UseMediaListResult } from "./useMediaList";
export { MediaPicker, type MediaPickerProps } from "./MediaPicker";

// Sprint 3.5: the Media Library page and its building blocks.
export { MediaPage } from "./MediaPage";
export { MediaGrid, type MediaGridProps } from "./MediaGrid";
export { MediaCard, type MediaCardProps } from "./MediaCard";
export { MediaUploadDialog, type MediaUploadDialogProps } from "./MediaUploadDialog";
export { MediaDeleteConfirm, type MediaDeleteConfirmProps } from "./MediaDeleteConfirm";
export { MediaUsageDialog, type MediaUsageDialogProps } from "./MediaUsageDialog";
export { MediaStatusFilter, type MediaStatusFilterProps } from "./MediaStatusFilter";
