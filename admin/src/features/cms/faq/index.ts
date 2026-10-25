/**
 * Public surface of the `cms/faq` feature.
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
export { useFaqs, type UseFaqsResult, useFaq, useFaqMutations, type UseFaqMutations } from "./hooks/useFaqs";

export {
  faqFormSchema,
  createFaqPayloadSchema,
  updateFaqPayloadSchema,
  formDataToCreatePayload,
  formDataToUpdatePayload,
  faqToFormData,
  type FaqFormData,
  type CreateFaqPayload as CreateFaqPayloadSchema,
  type UpdateFaqPayload as UpdateFaqPayloadSchema,
} from "./schema";

export { FaqPage } from "./FaqPage";
export { FaqList, type FaqListProps } from "./FaqList";
export { FaqRow, type FaqRowProps } from "./FaqRow";
export { FaqForm, type FaqFormProps } from "./FaqForm";
export { FaqStatusControl, type FaqStatusControlProps } from "./FaqStatusControl";
export { FaqStatusFilter, type FaqStatusFilterProps } from "./FaqStatusFilter";
export { FaqDeleteConfirm, type FaqDeleteConfirmProps } from "./FaqDeleteConfirm";
