import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeroSlide } from './entities/hero-slide.entity';
import { CreateHeroSlideDto } from './dto/create-hero-slide.dto';
import { UpdateHeroSlideDto } from './dto/update-hero-slide.dto';
import { SiteService } from '../../core/site/site.service';
import { OrderingService } from '../../core/ordering/ordering.service';
import { PublishingService } from '../../core/publishing/publishing.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { MediaService } from '../../core/media/media.service';
import {
  RevisionsService,
  RevisionEnabledType,
} from '../../core/revisions/revisions.service';

const ENTITY_TYPE: RevisionEnabledType = 'hero';

/** Editable fields captured in each revision snapshot — never id/siteId/position/status. */
function snapshotOf(slide: HeroSlide): Record<string, unknown> {
  return {
    heading: slide.heading,
    subheading: slide.subheading,
    ctaLabel: slide.ctaLabel,
    ctaUrl: slide.ctaUrl,
    backgroundMediaId: slide.backgroundMediaId,
  };
}

@Injectable()
export class HeroService {
  constructor(
    @InjectRepository(HeroSlide)
    private readonly heroRepo: Repository<HeroSlide>,
    private readonly siteService: SiteService,
    private readonly ordering: OrderingService,
    private readonly publishing: PublishingService,
    private readonly media: MediaService,
    private readonly revisions: RevisionsService,
  ) {}

  async create(dto: CreateHeroSlideDto, authorId: string): Promise<HeroSlide> {
    const siteId = this.siteService.getDefaultSiteId();
    const maxPosition = await this.heroRepo
      .createQueryBuilder('hero')
      .select('MAX(hero.position)', 'max')
      .where('hero.siteId = :siteId', { siteId })
      .getRawOne<{ max: number | null }>();

    const slide = await this.heroRepo.save(
      this.heroRepo.create({
        siteId,
        heading: dto.heading,
        subheading: dto.subheading,
        ctaLabel: dto.ctaLabel,
        ctaUrl: dto.ctaUrl,
        backgroundMediaId: dto.backgroundMediaId,
        position: (maxPosition?.max ?? -1) + 1,
        status: PublishStatus.DRAFT,
      }),
    );

    if (slide.backgroundMediaId) {
      await this.media.attach(slide.backgroundMediaId, ENTITY_TYPE, slide.id);
    }
    await this.revisions.record(ENTITY_TYPE, slide.id, snapshotOf(slide), authorId);
    return slide;
  }

  async findAll(status?: PublishStatus): Promise<HeroSlide[]> {
    const siteId = this.siteService.getDefaultSiteId();
    return this.heroRepo.find({
      where: { siteId, ...(status ? { status } : {}) },
      order: { position: 'ASC' },
    });
  }

  async findOne(id: string): Promise<HeroSlide> {
    return this.heroRepo.findOneByOrFail({ id });
  }

  async update(
    id: string,
    dto: UpdateHeroSlideDto,
    authorId: string,
  ): Promise<HeroSlide> {
    const slide = await this.findOne(id);
    const previousBackgroundMediaId = slide.backgroundMediaId;

    if (dto.heading !== undefined) slide.heading = dto.heading;
    if (dto.subheading !== undefined) slide.subheading = dto.subheading;
    if (dto.ctaLabel !== undefined) slide.ctaLabel = dto.ctaLabel;
    if (dto.ctaUrl !== undefined) slide.ctaUrl = dto.ctaUrl;
    if (dto.backgroundMediaId !== undefined) {
      slide.backgroundMediaId = dto.backgroundMediaId ?? undefined;
    }

    const saved = await this.heroRepo.save(slide);

    if (
      dto.backgroundMediaId !== undefined &&
      dto.backgroundMediaId !== previousBackgroundMediaId
    ) {
      if (previousBackgroundMediaId) {
        await this.media.detach(previousBackgroundMediaId, ENTITY_TYPE, saved.id);
      }
      if (saved.backgroundMediaId) {
        await this.media.attach(saved.backgroundMediaId, ENTITY_TYPE, saved.id);
      }
    }

    await this.revisions.record(ENTITY_TYPE, saved.id, snapshotOf(saved), authorId);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const slide = await this.findOne(id);
    if (slide.backgroundMediaId) {
      await this.media.detach(slide.backgroundMediaId, ENTITY_TYPE, slide.id);
    }
    await this.heroRepo.delete({ id });
  }

  async updateStatus(id: string, to: PublishStatus): Promise<HeroSlide> {
    const slide = await this.findOne(id);
    this.publishing.transition({
      from: slide.status,
      to,
      entityType: ENTITY_TYPE,
      entityId: slide.id,
      siteId: slide.siteId,
    });
    slide.status = to;
    return this.heroRepo.save(slide);
  }

  async reorder(orderedIds: string[]): Promise<void> {
    await this.ordering.reorder(this.heroRepo.manager, 'hero_slides', orderedIds);
  }

  async listRevisions(id: string) {
    return this.revisions.list(ENTITY_TYPE, id);
  }

  async restoreRevision(
    id: string,
    versionNumber: number,
    authorId: string,
  ): Promise<HeroSlide> {
    const revision = await this.revisions.getVersion(ENTITY_TYPE, id, versionNumber);
    const snapshot = revision.snapshot as {
      heading: HeroSlide['heading'];
      subheading?: HeroSlide['subheading'];
      ctaLabel?: HeroSlide['ctaLabel'];
      ctaUrl?: HeroSlide['ctaUrl'];
      backgroundMediaId?: HeroSlide['backgroundMediaId'];
    };
    return this.update(
      id,
      {
        heading: snapshot.heading,
        subheading: snapshot.subheading,
        ctaLabel: snapshot.ctaLabel,
        ctaUrl: snapshot.ctaUrl,
        backgroundMediaId: snapshot.backgroundMediaId ?? null,
      },
      authorId,
    );
  }
}
