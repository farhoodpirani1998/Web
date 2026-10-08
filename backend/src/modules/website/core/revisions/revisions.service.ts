import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentRevision } from './entities/content-revision.entity';

// Only these modules get revisions — structural/list content
// (Faq/Testimonial/Feature/GalleryItem/...) does not, since reverting
// a short field is trivial to just retype. Each of the types below
// carries a `body` of long-form prose worth diffing/restoring;
// `calendar_event` joins the set for the same reason `static_page`
// did — it's a News/Pages-shaped content type, not a structural list.
// `campus` joins for the same reason: each campus is its own indexable
// page with a long-form `body` (see Campus entity's doc comment); the
// mere presence of `position` (a Feature/Testimonial-style ordering
// field) alongside it doesn't change that. `teacher` joins for the
// identical reason: each teacher profile is its own indexable page with
// a long-form `bio` (see Teacher entity's doc comment).
export const REVISION_ENABLED_TYPES = [
  'hero',
  'about',
  'news_article',
  'static_page',
  'calendar_event',
  'campus',
  'teacher',
] as const;
export type RevisionEnabledType = (typeof REVISION_ENABLED_TYPES)[number];

@Injectable()
export class RevisionsService {
  constructor(
    @InjectRepository(ContentRevision)
    private readonly repo: Repository<ContentRevision>,
  ) {}

  async record(
    entityType: RevisionEnabledType,
    entityId: string,
    snapshot: Record<string, unknown>,
    authorId: string,
  ): Promise<ContentRevision> {
    const last = await this.repo.findOne({
      where: { entityType, entityId },
      order: { versionNumber: 'DESC' },
    });
    const versionNumber = (last?.versionNumber ?? 0) + 1;
    return this.repo.save(
      this.repo.create({ entityType, entityId, versionNumber, snapshot, authorId }),
    );
  }

  async list(entityType: RevisionEnabledType, entityId: string) {
    return this.repo.find({
      where: { entityType, entityId },
      order: { versionNumber: 'DESC' },
    });
  }

  async getVersion(
    entityType: RevisionEnabledType,
    entityId: string,
    versionNumber: number,
  ) {
    return this.repo.findOneOrFail({
      where: { entityType, entityId, versionNumber },
    });
  }

  // Restoring copies a past snapshot's fields back into the live entity
  // as a new edit, which itself creates a new revision — non-destructive.
  // The actual field copy happens in the calling content service, since
  // only it knows its own entity shape; this just hands back the snapshot.
}
