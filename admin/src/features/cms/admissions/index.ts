/**
 * Public surface of the `cms/admissions` feature.
 */
export type {
  AdmissionEntryKind,
  CmsAdmissionEntry,
  CmsAdmissionStatus,
  CreateAdmissionEntryPayload,
  UpdateAdmissionEntryPayload,
} from "./types";
export { ADMISSION_KIND_LABELS } from "./types";
export {
  fetchAdmissionEntryList,
  fetchAdmissionEntryById,
  createAdmissionEntry,
  updateAdmissionEntry,
  deleteAdmissionEntry,
  updateAdmissionEntryStatus,
  reorderAdmissionEntries,
} from "./api";
export { useAdmissions, type UseAdmissionsResult } from "./hooks/useAdmissions";

export { AdmissionsPage } from "./AdmissionsPage";
