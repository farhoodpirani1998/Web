/**
 * Public surface of the `cms/pages` feature.
 *
 * Other layers (pages, other CMS modules) should import from here
 * rather than reaching into `./api`, `./hooks/usePages`, etc. directly
 * — same convention as `features/cms/news/index.ts`.
 */
export type {
  CmsPage,
  CmsPageRevision,
  CmsPageStatus,
  CmsPageTemplate,
  CmsPageSeoMetadata,
  CmsPageSeoMetadataInput,
  CreatePagePayload,
  SchedulePagePayload,
  SetPageHomepagePayload,
  UpdatePagePayload,
} from "./types";
export { CMS_PAGE_TEMPLATES } from "./types";
export {
  fetchPagesList,
  fetchPageById,
  createPage,
  updatePage,
  deletePage,
  updatePageStatus,
  schedulePage,
  setPageHomepage,
  fetchPageRevisions,
  restorePageRevision,
} from "./api";
export { usePages, type UsePagesResult, usePageOptions, type UsePageOptionsResult } from "./hooks/usePages";

export { PagesPage } from "./PagesPage";
export { PageList, type PageListProps } from "./PageList";
export { PageRow, type PageRowProps } from "./PageRow";
export { PageForm, type PageFormProps } from "./PageForm";
export { PageStatusControl, type PageStatusControlProps } from "./PageStatusControl";
export { PageStatusFilter, type PageStatusFilterProps } from "./PageStatusFilter";
export { PageScheduleControl, type PageScheduleControlProps } from "./PageScheduleControl";
export { PageHomepageControl, type PageHomepageControlProps } from "./PageHomepageControl";
export { PageDeleteConfirm, type PageDeleteConfirmProps } from "./PageDeleteConfirm";
export { PageRevisionsPanel, type PageRevisionsPanelProps } from "./PageRevisionsPanel";
