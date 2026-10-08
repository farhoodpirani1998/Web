import { Injectable } from '@nestjs/common';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

/**
 * The minimal shape any content entity needs for a visibility check —
 * every content entity has `status`; only some (News, StaticPage) also
 * have `publishAt`.
 */
export interface PublishGate {
  status: PublishStatus;
  publishAt?: Date | null;
}

/**
 * Single shared definition of "is this row visible on the public site
 * right now." Every public-api controller filters through this instead
 * of re-deriving the status/publishAt check itself — same rule NewsService
 * and PagesService already apply in their own sitemap providers, just
 * factored out so the public-api layer (which reads far more content
 * types than those two) doesn't repeat it per controller.
 *
 * Deliberately does NOT do the DB-level `status = 'published'` filter —
 * each controller still applies that in its own query as a cheap first
 * pass (fewer rows to load) — this only adds the `publishAt` check
 * that can't be expressed as a static query parameter.
 */
@Injectable()
export class PublicVisibilityService {
  isVisible(entity: PublishGate, now: Date = new Date()): boolean {
    if (entity.status !== PublishStatus.PUBLISHED) return false;
    if (entity.publishAt && entity.publishAt > now) return false;
    return true;
  }

  filterVisible<T extends PublishGate>(
    entities: T[],
    now: Date = new Date(),
  ): T[] {
    return entities.filter((entity) => this.isVisible(entity, now));
  }
}
