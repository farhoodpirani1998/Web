/**
 * Public surface of the `cms/pages` feature.
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
export { usePages, type UsePagesResult, usePageOptions, type UsePageOptionsResult, usePage, usePageMutations, type UsePageMutations } from "./hooks/usePages";

export {
  pageFormSchema,
  createPagePayloadSchema,
  updatePagePayloadSchema,
  schedulePagePayloadSchema,
  formDataToCreatePayload,
  formDataToUpdatePayload,
  pageToFormData,
  SLUG_PATTERN,
  type PageFormData,
  type SeoMetadataInput,
  type CreatePagePayload as CreatePagePayloadSchema,
  type UpdatePagePayload as UpdatePagePayloadSchema,
  type SchedulePagePayload as SchedulePagePayloadSchema,
} from "./schema";

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
