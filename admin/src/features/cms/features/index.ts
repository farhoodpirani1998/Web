/**
 * Public surface of the `cms/features` feature.
 *
 * Other layers (pages, other CMS modules) should import from here
 * rather than reaching into `./api`, `./hooks/useFeatures`, etc.
 * directly — same convention as `features/cms/faq/index.ts`.
 */
export type {
  CmsFeature,
  CmsFeatureStatus,
  CreateFeaturePayload,
  UpdateFeaturePayload,
} from "./types";
export {
  fetchFeatureList,
  fetchFeatureById,
  createFeature,
  updateFeature,
  deleteFeature,
  updateFeatureStatus,
  reorderFeatures,
} from "./api";
export { useFeatures, type UseFeaturesResult } from "./hooks/useFeatures";

export { FeaturesPage } from "./FeaturesPage";
export { FeatureList, type FeatureListProps } from "./FeatureList";
export { FeatureRow, type FeatureRowProps } from "./FeatureRow";
export { FeatureForm, type FeatureFormProps } from "./FeatureForm";
export { FeatureStatusControl, type FeatureStatusControlProps } from "./FeatureStatusControl";
export { FeatureStatusFilter, type FeatureStatusFilterProps } from "./FeatureStatusFilter";
export { FeatureDeleteConfirm, type FeatureDeleteConfirmProps } from "./FeatureDeleteConfirm";
