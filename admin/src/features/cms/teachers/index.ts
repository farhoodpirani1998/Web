/**
 * Public surface of the `cms/teachers` feature.
 *
 * Other layers (pages, other CMS modules) should import from here
 * rather than reaching into `./api`, `./hooks/useTeachers`, etc.
 * directly — same convention as `features/cms/events/index.ts`.
 */
export type {
  CmsTeacher,
  CmsTeacherRevision,
  CmsTeacherStatus,
  CmsTeacherSeoMetadata,
  CmsTeacherSeoMetadataInput,
  CreateTeacherPayload,
  ScheduleTeacherPayload,
  UpdateTeacherPayload,
} from "./types";
export {
  fetchTeachersList,
  fetchTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  updateTeacherStatus,
  scheduleTeacher,
  reorderTeachers,
  fetchTeacherRevisions,
  restoreTeacherRevision,
} from "./api";
export { useTeachers, type UseTeachersResult } from "./hooks/useTeachers";

export { TeachersPage } from "./TeachersPage";
export { TeacherList, type TeacherListProps } from "./TeacherList";
export { TeacherRow, type TeacherRowProps } from "./TeacherRow";
export { TeacherForm, type TeacherFormProps } from "./TeacherForm";
export { TeacherStatusControl, type TeacherStatusControlProps } from "./TeacherStatusControl";
export { TeacherStatusFilter, type TeacherStatusFilterProps } from "./TeacherStatusFilter";
export { TeacherScheduleControl, type TeacherScheduleControlProps } from "./TeacherScheduleControl";
export { TeacherDeleteConfirm, type TeacherDeleteConfirmProps } from "./TeacherDeleteConfirm";
export { TeacherRevisionsPanel, type TeacherRevisionsPanelProps } from "./TeacherRevisionsPanel";
