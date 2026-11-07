/**
 * Public surface of the `cms/testimonials` feature.
 *
 * Other layers (pages, other CMS modules) should import from here
 * rather than reaching into `./api`, `./hooks/useTestimonials`, etc.
 * directly — same convention as `features/cms/faq/index.ts`.
 */
export type {
  CmsTestimonial,
  CmsTestimonialStatus,
  CreateTestimonialPayload,
  UpdateTestimonialPayload,
} from "./types";
export {
  fetchTestimonialList,
  fetchTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  updateTestimonialStatus,
  reorderTestimonials,
} from "./api";
export {
  testimonialFormSchema,
  translatableSchema,
  createTestimonialPayloadSchema,
  updateTestimonialPayloadSchema,
  type TestimonialFormData,
  formDataToCreatePayload,
  formDataToUpdatePayload,
  testimonialToFormData,
} from "./schema";

export { useTestimonials, type UseTestimonialsResult, testimonialKeys, useTestimonialList, useTestimonialById, useTestimonialMutations, type UseTestimonialListResult, type UseTestimonialMutations } from "./hooks/useTestimonials";
export { TestimonialsPage } from "./TestimonialsPage";
export { TestimonialList, type TestimonialListProps } from "./TestimonialList";
export { TestimonialRow, type TestimonialRowProps } from "./TestimonialRow";
export { TestimonialForm, type TestimonialFormProps } from "./TestimonialForm";
export {
  TestimonialStatusControl,
  type TestimonialStatusControlProps,
} from "./TestimonialStatusControl";
export {
  TestimonialStatusFilter,
  type TestimonialStatusFilterProps,
} from "./TestimonialStatusFilter";
export {
  TestimonialDeleteConfirm,
  type TestimonialDeleteConfirmProps,
} from "./TestimonialDeleteConfirm";
