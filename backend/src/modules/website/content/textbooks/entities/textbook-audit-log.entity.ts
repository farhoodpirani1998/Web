import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../core/common/base.entity';

@Entity('textbook_audit_logs')
@Index('idx_textbook_audit_logs_textbook_created', ['textbookId', 'createdAt'])
export class TextbookAuditLog extends BaseEntity {
  @Column({ type: 'uuid', nullable: true })
  textbookId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  actorId!: string | null;

  @Column({ type: 'varchar', length: 40 })
  action!: string;
}
