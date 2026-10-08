/**
 * Public surface of the `cms/about` feature.
 *
 * Other layers (pages, other CMS modules) should import from here
 * rather than reaching into `./api`, `./hooks/useAbout`, etc. directly
 * — same convention as `features/cms/campuses/index.ts`.
 */
export type {
  CmsAbout,
  CmsAboutSeoMetadata,
  CmsAboutSeoMetadataInput,
  CmsAboutStatus,
  CmsAboutRevision,
  UpdateAboutPayload,
} from "./types";
export {
  fetchAbout,
  updateAbout,
  updateAboutStatus,
  fetchAboutRevisions,
  restoreAboutRevision,
} from "./api";
export { useAbout, type UseAboutResult } from "./hooks/useAbout";

export { AboutPage } from "./AboutPage";
export { AboutForm, type AboutFormProps } from "./AboutForm";
export { AboutStatusControl, type AboutStatusControlProps } from "./AboutStatusControl";
export {
  AboutRevisionsPanel,
  type AboutRevisionsPanelProps,
} from "./AboutRevisionsPanel";
