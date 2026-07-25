/**
 * Public surface of the `cms/pre-registrations` feature.
 *
 * Other layers (pages, other CMS modules) should import from here
 * rather than reaching into `./api`, `./hooks/usePreRegistrations`,
 * etc. directly — same convention as `features/cms/faq/index.ts`.
 */
export type {
  CmsPreRegistration,
  CmsPreRegistrationStatus,
  UpdatePreRegistrationStatusPayload,
} from "./types";
export {
  fetchPreRegistrationList,
  fetchPreRegistrationById,
  updatePreRegistrationStatus,
  deletePreRegistration,
} from "./api";
export { usePreRegistrations, type UsePreRegistrationsResult } from "./hooks/usePreRegistrations";

export { PreRegistrationsPage } from "./PreRegistrationsPage";
export { PreRegistrationList, type PreRegistrationListProps } from "./PreRegistrationList";
export { PreRegistrationRow, type PreRegistrationRowProps } from "./PreRegistrationRow";
export { PreRegistrationDetail, type PreRegistrationDetailProps } from "./PreRegistrationDetail";
export {
  PreRegistrationDeleteConfirm,
  type PreRegistrationDeleteConfirmProps,
} from "./PreRegistrationDeleteConfirm";
export {
  PreRegistrationStatusFilter,
  type PreRegistrationStatusFilterProps,
} from "./PreRegistrationStatusFilter";
export {
  PreRegistrationStatusControl,
  type PreRegistrationStatusControlProps,
} from "./PreRegistrationStatusControl";
