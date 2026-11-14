import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('textbook_file_cleanup')
@Index('idx_textbook_file_cleanup_due', ['nextAttemptAt'])
export class TextbookFileCleanup {
  @PrimaryColumn({ name: 'file_key', type: 'varchar', length: 512 })
  fileKey!: string;

  @Column({ name: 'attempt_count', type: 'integer', default: 0 })
  attemptCount!: number;

  @Column({
    name: 'next_attempt_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  nextAttemptAt!: Date;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date;

  @Column({ name: 'exhausted_at', type: 'timestamptz', nullable: true })
  exhaustedAt!: Date | null;
}
