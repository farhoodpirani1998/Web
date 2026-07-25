/**
 * Admin-side triage state for a Pre-Registration submission — NOT the
 * core `PublishStatus` (draft/published/archived): a submission has no
 * publish/revision lifecycle, it's simply worked through by CMS staff.
 * Kept as its own small module-local enum rather than reusing
 * `PublishStatus`'s values, since "new"/"contacted"/"archived" carry
 * different meaning here (triage progress, not content visibility) and
 * `PublishingService.transition`'s `VALID_TRANSITIONS` shouldn't govern
 * something that isn't publish state.
 */
export enum PreRegistrationStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  ARCHIVED = 'archived',
}
