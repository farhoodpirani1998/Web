import { Entity, Index, Column } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';

@Entity('newsletter_subscribers')
@Index(['siteId', 'email'], { unique: true })
@Index(['siteId', 'createdAt'])
export class NewsletterSubscriber extends BaseSiteScopedEntity {
  @Column({ length: 254 })
  email!: string;
}
