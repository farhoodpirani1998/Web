export enum PublishStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

/** Valid transitions — enforced centrally so no content module reinvents this. */
export const VALID_TRANSITIONS: Record<PublishStatus, PublishStatus[]> = {
  [PublishStatus.DRAFT]: [PublishStatus.PUBLISHED, PublishStatus.ARCHIVED],
  [PublishStatus.PUBLISHED]: [PublishStatus.ARCHIVED, PublishStatus.DRAFT],
  [PublishStatus.ARCHIVED]: [PublishStatus.DRAFT],
};
