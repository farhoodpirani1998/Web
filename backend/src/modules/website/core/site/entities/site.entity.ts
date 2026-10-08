import { Entity, Column, Unique } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

/**
 * Site is the literal root of the schema. Today exactly one row exists
 * (key: "main"). There is deliberately no tenant-resolution middleware or
 * subdomain parsing yet — that would be speculative complexity ahead of
 * an actual second site. Every content entity is siteId-scoped so that if
 * a second site is ever needed, it's an additive row + resolution logic,
 * not a restructuring of existing tables.
 */
@Entity('sites')
@Unique(['key'])
export class Site extends BaseEntity {
  @Column()
  key!: string; // e.g. "main"

  @Column()
  name!: string;

  @Column({ nullable: true })
  domain!: string;
}
