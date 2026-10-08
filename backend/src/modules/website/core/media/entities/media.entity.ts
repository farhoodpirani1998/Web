import { Entity, Column } from 'typeorm';
import { BaseSiteScopedEntity } from '../../common/base-site-scoped.entity';

export enum MediaStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

/**
 * One entity for all media in the product. Content entities never embed
 * media by copy — they hold a reference (mediaId) to this table.
 */
@Entity('media')
export class Media extends BaseSiteScopedEntity {
  @Column()
  storageKey!: string;

  @Column()
  url!: string;

  @Column({ nullable: true })
  thumbnailUrl?: string;

  @Column({ nullable: true })
  cardUrl?: string;

  @Column()
  mimeType!: string;

  @Column({ type: 'int' })
  sizeBytes!: number;

  // Mandatory at the service layer even though nullable here at the
  // column level would be wrong — enforced by MediaService.upload(),
  // not left to a DB constraint alone.
  @Column({ type: 'text' })
  altText!: string;

  @Column({ type: 'enum', enum: MediaStatus, default: MediaStatus.ACTIVE })
  status!: MediaStatus;
}
