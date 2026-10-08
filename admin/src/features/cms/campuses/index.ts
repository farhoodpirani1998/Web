/**
 * Public surface of the `cms/campuses` feature.
 *
 * Other layers (pages, other CMS modules) should import from here
 * rather than reaching into `./api`, `./hooks/useCampuses`, etc.
 * directly — same convention as `features/cms/teachers/index.ts`.
 */
export type {
  CmsCampus,
  CmsCampusRevision,
  CmsCampusStatus,
  CmsCampusSeoMetadata,
  CmsCampusSeoMetadataInput,
  CreateCampusPayload,
  ScheduleCampusPayload,
  UpdateCampusPayload,
} from "./types";
export {
  fetchCampusesList,
  fetchCampusById,
  createCampus,
  updateCampus,
  deleteCampus,
  updateCampusStatus,
  scheduleCampus,
  reorderCampuses,
  fetchCampusRevisions,
  restoreCampusRevision,
} from "./api";
export { useCampuses, type UseCampusesResult } from "./hooks/useCampuses";

export { CampusesPage } from "./CampusesPage";
export { CampusList, type CampusListProps } from "./CampusList";
export { CampusRow, type CampusRowProps } from "./CampusRow";
export { CampusForm, type CampusFormProps } from "./CampusForm";
export { CampusStatusControl, type CampusStatusControlProps } from "./CampusStatusControl";
export { CampusStatusFilter, type CampusStatusFilterProps } from "./CampusStatusFilter";
export { CampusScheduleControl, type CampusScheduleControlProps } from "./CampusScheduleControl";
export { CampusDeleteConfirm, type CampusDeleteConfirmProps } from "./CampusDeleteConfirm";
export { CampusRevisionsPanel, type CampusRevisionsPanelProps } from "./CampusRevisionsPanel";
