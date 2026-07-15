import { Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

/**
 * Every content entity extends this. siteId exists from day one so that
 * multi-site support later is additive (new Site row + request-time
 * resolution), never a restructuring of existing tables.
 *
 * Today exactly one Site row exists (key: "main") and is treated as a
 * known constant via SiteService.getDefault() — not resolved per request.
 */
export abstract class BaseSiteScopedEntity extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  siteId!: string;
}
