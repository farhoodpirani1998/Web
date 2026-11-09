/**
 * Public surface of the `cms/news` feature.
 *
 * Other layers (pages, other CMS modules) should import from here
 * rather than reaching into `./api`, `./hooks/useNews`, etc. directly —
 * same convention as `features/cms/hero-slides/index.ts`.
 */
export type {
  CmsNewsArticle,
  CmsNewsRevision,
  CmsNewsStatus,
  CmsSeoMetadata,
  CmsSeoMetadataInput,
  CreateNewsArticlePayload,
  ScheduleNewsArticlePayload,
  UpdateNewsArticlePayload,
} from "./types";
export {
  fetchNewsList,
  fetchNewsArticleById,
  createNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
  updateNewsArticleStatus,
  scheduleNewsArticle,
  fetchNewsRevisions,
  restoreNewsRevision,
} from "./api";
export { useNewsList, type UseNewsListResult } from "./hooks/useNews";

export {
  newsFormSchema,
  createNewsPayloadSchema,
  updateNewsPayloadSchema,
  scheduleNewsPayloadSchema,
  type NewsFormData,
  type CreateNewsPayload,
  type UpdateNewsPayload,
  type ScheduleNewsPayload,
  formDataToCreatePayload,
  formDataToUpdatePayload,
  newsToFormData,
} from "./schema";
export { useNewsDetail, useCreateNews, useUpdateNews, useDeleteNews, useUpdateNewsStatus, newsKeys } from "./hooks/useNews";
export { NewsPage } from "./NewsPage";
export { NewsForm } from "./NewsForm";
export { default as NewsList } from "./NewsList";
export { NewsRow, type NewsRowProps } from "./NewsRow";
export { NewsStatusControl, type NewsStatusControlProps } from "./NewsStatusControl";
export { NewsStatusFilter, type NewsStatusFilterProps } from "./NewsStatusFilter";
export { NewsScheduleControl, type NewsScheduleControlProps } from "./NewsScheduleControl";
export { NewsDeleteConfirm, type NewsDeleteConfirmProps } from "./NewsDeleteConfirm";
export { NewsRevisionsPanel, type NewsRevisionsPanelProps } from "./NewsRevisionsPanel";
