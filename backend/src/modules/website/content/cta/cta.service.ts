import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CtaBanner } from './entities/cta.entity';
import { UpdateCtaDto } from './dto/update-cta.dto';
import { SiteService } from '../../core/site/site.service';
import { PublishingService } from '../../core/publishing/publishing.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { MediaService } from '../../core/media/media.service';

const ENTITY_TYPE = 'cta';

/**
 * CTA Banner is a singleton per site — there is exactly one row,
 * auto-seeded on startup the same way AboutService/SiteSettingsService
 * seed their own singleton rows, rather than exposing create/delete
 * endpoints for something that always exists exactly once.
 *
 * No revisions, no sitemap registration — see CtaBanner entity doc for
 * why. Whether the banner is shown at all lives in
 * SiteFeatureFlags.ctaEnabled (SiteSettingsService), not here — this
 * service only manages the banner's own content/status.
 */
@Injectable()
export class CtaService implements OnModuleInit {
  constructor(
    @InjectRepository(CtaBanner)
    private readonly ctaRepo: Repository<CtaBanner>,
    private readonly siteService: SiteService,
    private readonly publishing: PublishingService,
    private readonly media: MediaService,
  ) {}

  async onModuleInit() {
    const siteId = this.siteService.getDefaultSiteId();
    const existing = await this.ctaRepo.findOne({ where: { siteId } });
    if (!existing) {
      await this.ctaRepo.save(
        this.ctaRepo.create({
          siteId,
          title: { fa: '' },
          primaryButtonLabel: { fa: '' },
          primaryButtonUrl: '',
          status: PublishStatus.DRAFT,
        }),
      );
    }
  }

  async get(): Promise<CtaBanner> {
    const siteId = this.siteService.getDefaultSiteId();
    return this.ctaRepo.findOneByOrFail({ siteId });
  }

  async update(dto: UpdateCtaDto): Promise<CtaBanner> {
    const cta = await this.get();
    const previousBackgroundImageMediaId = cta.backgroundImageMediaId;

    if (dto.title !== undefined) cta.title = dto.title;
    if (dto.description !== undefined) cta.description = dto.description ?? undefined;
    if (dto.primaryButtonLabel !== undefined) cta.primaryButtonLabel = dto.primaryButtonLabel;
    if (dto.primaryButtonUrl !== undefined) cta.primaryButtonUrl = dto.primaryButtonUrl;
    if (dto.secondaryButtonLabel !== undefined) {
      cta.secondaryButtonLabel = dto.secondaryButtonLabel ?? undefined;
    }
    if (dto.secondaryButtonUrl !== undefined) {
      cta.secondaryButtonUrl = dto.secondaryButtonUrl ?? undefined;
    }
    if (dto.backgroundImageMediaId !== undefined) {
      cta.backgroundImageMediaId = dto.backgroundImageMediaId ?? undefined;
    }

    const saved = await this.ctaRepo.save(cta);

    if (
      dto.backgroundImageMediaId !== undefined &&
      dto.backgroundImageMediaId !== previousBackgroundImageMediaId
    ) {
      if (previousBackgroundImageMediaId) {
        await this.media.detach(previousBackgroundImageMediaId, ENTITY_TYPE, saved.id);
      }
      if (saved.backgroundImageMediaId) {
        await this.media.attach(saved.backgroundImageMediaId, ENTITY_TYPE, saved.id);
      }
    }

    return saved;
  }

  async updateStatus(to: PublishStatus): Promise<CtaBanner> {
    const cta = await this.get();
    this.publishing.transition({
      from: cta.status,
      to,
      entityType: ENTITY_TYPE,
      entityId: cta.id,
      siteId: cta.siteId,
    });
    cta.status = to;
    return this.ctaRepo.save(cta);
  }
}
