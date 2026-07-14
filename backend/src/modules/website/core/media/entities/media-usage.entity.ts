import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

/**
 * Every attach/detach of a Media row to a content entity writes one of
 * these. Lets the admin show "used in N places" and lets purge refuse to
 * delete an in-use asset.
 */
@Entity('media_usages')
@Index(['mediaId', 'entityType', 'entityId'], { unique: true })
export class MediaUsage extends BaseEntity {
  @Column({ type: 'uuid' })
  mediaId!: string;

  @Column()
  entityType!: string;

  @Column({ type: 'uuid' })
  entityId!: string;
}
