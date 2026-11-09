import { Column, Entity, Index } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';
import { PublishStatus } from '../../../core/publishing/publish-status.enum';

export enum TextbookSourceType {
  UPLOADED = 'UPLOADED',
  EXTERNAL_LINK = 'EXTERNAL_LINK',
}

@Entity('textbooks')
@Index('uq_textbooks_site_slug', ['siteId', 'slug'], { unique: true })
@Index('uq_textbooks_site_code', ['siteId', 'code'], { unique: true })
export class Textbook extends BaseSiteScopedEntity {
  @Column({ type: 'jsonb' })
  title!: { fa: string; en?: string };

  @Column({ type: 'varchar', length: 180 })
  slug!: string;

  @Column({ type: 'varchar', length: 80 })
  code!: string;

  @Column({ type: 'varchar', length: 100 })
  stage!: string;

  @Column({ type: 'varchar', length: 80 })
  grade!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  field!: string | null;

  @Column({ type: 'varchar', length: 120 })
  subject!: string;

  @Column({ type: 'varchar', length: 24 })
  academicYear!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  edition!: string | null;

  @Column({ type: 'integer', nullable: true })
  pageCount!: number | null;

  @Column({ type: 'bigint', default: 0 })
  fileSize!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  checksum!: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  coverKey!: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  fileKey!: string | null;

  @Column({ type: 'varchar', length: 20, default: TextbookSourceType.UPLOADED })
  sourceType!: TextbookSourceType;

  @Column({ type: 'text', nullable: true })
  externalUrl!: string | null;

  @Column({ type: 'varchar', length: 300 })
  sourceAttribution!: string;

  @Column({ type: 'text', nullable: true })
  licenseNote!: string | null;

  @Column({ type: 'varchar', length: 20, default: PublishStatus.DRAFT })
  status!: PublishStatus;

  @Column({ type: 'integer', default: 0 })
  sortOrder!: number;

  @Column({ type: 'bigint', default: 0 })
  downloadCount!: string;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
