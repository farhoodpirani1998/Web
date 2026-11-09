import { Column, Entity, Index } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';
import { ContactMessageStatus } from './contact-message-status.enum';
import { ContactMessageSubject } from './contact-message-subject.enum';

@Entity('contact_messages')
@Index('IDX_contact_messages_siteId_createdAt', ['siteId', 'createdAt'])
export class ContactMessage extends BaseSiteScopedEntity {
  @Column({ length: 150 })
  fullName!: string;

  @Column({ length: 24 })
  phone!: string;

  @Column({
    type: 'enum',
    enum: ContactMessageSubject,
    enumName: 'contact_messages_subject_enum',
  })
  subject!: ContactMessageSubject;

  @Column({ type: 'text' })
  message!: string;

  @Index('IDX_contact_messages_status')
  @Column({
    type: 'enum',
    enum: ContactMessageStatus,
    enumName: 'contact_messages_status_enum',
    default: ContactMessageStatus.NEW,
  })
  status!: ContactMessageStatus;
}
