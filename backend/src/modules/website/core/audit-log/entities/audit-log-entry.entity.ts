import { Entity, Column, Index } from 'typeorm';
import { BaseSiteScopedEntity } from '../../common/base-site-scoped.entity';

/**
 * One row per notable CMS write action, powering the admin Dashboard's
 * "Recent Activity" section. Populated exclusively by
 * `AuditLogListener` reacting to the existing `WEBSITE_EVENTS` already
 * emitted by `PublishingService`/`MediaService`/`SiteSettingsService`/
 * `PortalLinksService` — no content service or controller is modified
 * to write here directly (see `audit-log.listener.ts`'s own comment).
 *
 * No `authorId` column: none of the events this listens to carry one
 * today (see `audit-log.listener.ts`'s comment on why), so this table
 * deliberately doesn't invent a nullable column that would always be
 * empty. If/when a second CMS admin is added and status-change routes
 * start passing `@CurrentAdmin()`, that's an additive column, not a
 * restructuring of this table.
 *
 * `action` is a free-form string (e.g. "published", "draft",
 * "archived", "media_uploaded", "settings_updated") rather than a
 * Postgres enum — unlike content status columns, this isn't validated
 * against a fixed transition table, it's just whatever the source
 * event reports, and new event types shouldn't require a migration.
 */
@Entity('audit_log_entries')
@Index(['siteId', 'createdAt'])
export class AuditLogEntry extends BaseSiteScopedEntity {
  @Column()
  action!: string;

  @Column({ nullable: true })
  entityType?: string;

  @Column({ type: 'uuid', nullable: true })
  entityId?: string;

  /** Free-form extra context (e.g. `{ group: "seo" }` for a settings update). Never PII. */
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
