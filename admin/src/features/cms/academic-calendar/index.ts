/**
 * Public surface of the `cms/academic-calendar` feature.
 */
export type {
  AcademicCalendarEntryKind,
  CmsAcademicCalendarEntry,
  CmsAcademicCalendarStatus,
  CreateAcademicCalendarEntryPayload,
  UpdateAcademicCalendarEntryPayload,
} from "./types";
export { ACADEMIC_CALENDAR_KIND_LABELS } from "./types";
export {
  fetchAcademicCalendarEntryList,
  fetchAcademicCalendarEntryById,
  createAcademicCalendarEntry,
  updateAcademicCalendarEntry,
  deleteAcademicCalendarEntry,
  updateAcademicCalendarEntryStatus,
  reorderAcademicCalendarEntries,
} from "./api";
export {
  useAcademicCalendar,
  type UseAcademicCalendarResult,
} from "./hooks/useAcademicCalendar";

export { AcademicCalendarPage } from "./AcademicCalendarPage";
