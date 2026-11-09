import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../core/common/base.entity';

@Entity('textbook_download_logs')
@Index('idx_textbook_download_logs_textbook_created', [
  'textbookId',
  'createdAt',
])
export class TextbookDownloadLog extends BaseEntity {
  @Column({ type: 'uuid' })
  textbookId!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  requesterHash!: string | null;
}
