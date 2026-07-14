import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

/**
 * One shared shape for all revision-enabled modules (not four near-
 * duplicate tables). entityType + entityId scopes it; snapshot is a full
 * JSON copy of editable content fields at save time — no diffing engine.
 */
@Entity('content_revisions')
@Index(['entityType', 'entityId', 'versionNumber'], { unique: true })
export class ContentRevision extends BaseEntity {
  @Column()
  entityType!: string; // "hero" | "about" | "news_article" | "static_page"

  @Column({ type: 'uuid' })
  entityId!: string;

  @Column({ type: 'int' })
  versionNumber!: number;

  @Column({ type: 'jsonb' })
  snapshot!: Record<string, unknown>;

  @Column({ type: 'uuid' })
  authorId!: string;
}
