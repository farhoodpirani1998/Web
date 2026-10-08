import { Column } from 'typeorm';

/**
 * Reusable embedded shape attached to every content entity that renders
 * a public page. One definition, embedded via TypeORM's column(() => ...)
 * pattern in each owning entity — not a separate joined table.
 */
export class SeoMetadata {
  @Column({ nullable: true })
  metaTitle?: string;

  @Column({ nullable: true, type: 'text' })
  metaDescription?: string;

  @Column({ nullable: true })
  ogImageUrl?: string;

  @Column({ nullable: true })
  canonicalUrl?: string;

  @Column({ default: false })
  noindex!: boolean;
}
