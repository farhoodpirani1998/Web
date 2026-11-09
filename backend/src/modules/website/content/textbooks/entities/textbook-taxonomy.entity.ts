import { Column, Entity, Index } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';

export enum TextbookTaxonomyType {
  STAGE = 'stage',
  GRADE = 'grade',
  FIELD = 'field',
  SUBJECT = 'subject',
}

@Entity('textbook_taxonomies')
@Index('uq_textbook_taxonomies_site_type_value', ['siteId', 'type', 'value'], {
  unique: true,
})
export class TextbookTaxonomy extends BaseSiteScopedEntity {
  @Column({ type: 'varchar', length: 20 })
  type!: TextbookTaxonomyType;

  @Column({ type: 'varchar', length: 120 })
  value!: string;

  @Column({ type: 'varchar', length: 160 })
  label!: string;

  @Column({ type: 'integer', default: 0 })
  sortOrder!: number;
}
