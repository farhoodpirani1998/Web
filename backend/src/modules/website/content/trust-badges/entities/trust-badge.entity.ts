import { Column, Entity, Index } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';
import { PublishStatus } from '../../../core/publishing/publish-status.enum';
import { Translatable } from '../../../core/i18n/locale.enum';

@Entity('trust_badges')
export class TrustBadge extends BaseSiteScopedEntity {
  @Column({ type: 'jsonb' })
  name!: Translatable<string>;

  @Column({ type: 'text', nullable: true })
  url?: string;

  @Column({ type: 'uuid', nullable: true })
  imageMediaId?: string;

  @Index()
  @Column({ type: 'int', default: 0 })
  position!: number;

  @Column({ type: 'enum', enum: PublishStatus, default: PublishStatus.DRAFT })
  status!: PublishStatus;
}
