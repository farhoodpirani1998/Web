/**
 * Public surface of the `cms/faq` feature.
 *
 * Other layers (pages, other CMS modules) should import from here
 * rather than reaching into `./api`, `./hooks/useFaqs`, etc. directly —
 * same convention as `features/cms/media/index.ts`.
 */
export type { CmsFaq, CmsFaqStatus, CreateFaqPayload, UpdateFaqPayload } from "./types";
export {
  fetchFaqList,
  fetchFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
  updateFaqStatus,
  reorderFaqs,
} from "./api";
export { useFaqs, type UseFaqsResult } from "./hooks/useFaqs";

export { FaqPage } from "./FaqPage";
export { FaqList, type FaqListProps } from "./FaqList";
export { FaqRow, type FaqRowProps } from "./FaqRow";
export { FaqForm, type FaqFormProps } from "./FaqForm";
export { FaqStatusControl, type FaqStatusControlProps } from "./FaqStatusControl";
export { FaqStatusFilter, type FaqStatusFilterProps } from "./FaqStatusFilter";
export { FaqDeleteConfirm, type FaqDeleteConfirmProps } from "./FaqDeleteConfirm";
