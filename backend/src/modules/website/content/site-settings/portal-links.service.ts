import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PortalLink } from './entities/portal-link.entity';
import { CreatePortalLinkDto } from './dto/create-portal-link.dto';
import { UpdatePortalLinkDto } from './dto/update-portal-link.dto';
import { SiteService } from '../../core/site/site.service';
import { OrderingService } from '../../core/ordering/ordering.service';
import { RedisService } from '../../core/redis/redis.service';
import { buildPublicCacheKey } from '../../public-api/common/public-cache.constants';
import { WEBSITE_EVENTS, SettingsUpdatedPayload } from '../../core/events/events.constants';

/**
 * CRUD + reorder for Portal Links — same shape as FeaturesService
 * (flat, table-wide `position`, via OrderingService), minus the
 * PublishStatus lifecycle: portal links go live/hidden immediately via
 * `visible`, there's no draft/review step. Emits the same
 * SETTINGS_UPDATED event SiteSettingsService uses for its own
 * sections, with group 'portal_links', since — despite living in its
 * own table — this is conceptually part of Site Settings.
 */
@Injectable()
export class PortalLinksService {
  constructor(
    @InjectRepository(PortalLink)
    private readonly portalLinkRepo: Repository<PortalLink>,
    private readonly siteService: SiteService,
    private readonly ordering: OrderingService,
    private readonly events: EventEmitter2,
    private readonly redis: RedisService,
  ) {}

  private async emitUpdated(siteId: string) {
    const payload: SettingsUpdatedPayload = { siteId, group: 'portal_links' };
    this.events.emit(WEBSITE_EVENTS.SETTINGS_UPDATED, payload);
    await this.redis.delete(buildPublicCacheKey('portal-links'));
  }

  async create(dto: CreatePortalLinkDto): Promise<PortalLink> {
    const siteId = this.siteService.getDefaultSiteId();
    const maxPosition = await this.portalLinkRepo
      .createQueryBuilder('portalLink')
      .select('MAX(portalLink.position)', 'max')
      .where('portalLink.siteId = :siteId', { siteId })
      .getRawOne<{ max: number | null }>();

    const saved = await this.portalLinkRepo.save(
      this.portalLinkRepo.create({
        siteId,
        label: dto.label,
        url: dto.url,
        icon: dto.icon,
        visible: dto.visible ?? true,
        position: (maxPosition?.max ?? -1) + 1,
      }),
    );

    await this.emitUpdated(siteId);
    return saved;
  }

  async findAll(): Promise<PortalLink[]> {
    const siteId = this.siteService.getDefaultSiteId();
    return this.portalLinkRepo.find({
      where: { siteId },
      order: { position: 'ASC' },
    });
  }

  async findOne(id: string): Promise<PortalLink> {
    return this.portalLinkRepo.findOneByOrFail({ id });
  }

  async update(id: string, dto: UpdatePortalLinkDto): Promise<PortalLink> {
    const portalLink = await this.findOne(id);
    if (dto.label !== undefined) portalLink.label = dto.label;
    if (dto.url !== undefined) portalLink.url = dto.url;
    if (dto.icon !== undefined) portalLink.icon = dto.icon;
    if (dto.visible !== undefined) portalLink.visible = dto.visible;

    const saved = await this.portalLinkRepo.save(portalLink);
    await this.emitUpdated(saved.siteId);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const portalLink = await this.findOne(id);
    await this.portalLinkRepo.delete({ id });
    await this.emitUpdated(portalLink.siteId);
  }

  async reorder(orderedIds: string[]): Promise<void> {
    await this.ordering.reorder(this.portalLinkRepo.manager, 'portal_links', orderedIds);
    await this.emitUpdated(this.siteService.getDefaultSiteId());
  }
}
