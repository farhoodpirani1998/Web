import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrustBadge } from './entities/trust-badge.entity';
import { CreateTrustBadgeDto } from './dto/create-trust-badge.dto';
import { UpdateTrustBadgeDto } from './dto/update-trust-badge.dto';
import { SiteService } from '../../core/site/site.service';
import { OrderingService } from '../../core/ordering/ordering.service';
import { PublishingService } from '../../core/publishing/publishing.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { MediaService } from '../../core/media/media.service';
import { RedisService } from '../../core/redis/redis.service';
import { buildPublicCacheKey } from '../../public-api/common/public-cache.constants';

const ENTITY_TYPE = 'trust_badge';
const PUBLIC_LIST_CACHE_KEY = buildPublicCacheKey('trust-badges', 'list');

@Injectable()
export class TrustBadgesService {
  constructor(
    @InjectRepository(TrustBadge)
    private readonly trustBadgeRepo: Repository<TrustBadge>,
    private readonly siteService: SiteService,
    private readonly ordering: OrderingService,
    private readonly publishing: PublishingService,
    private readonly media: MediaService,
    private readonly redis: RedisService,
  ) {}

  async create(dto: CreateTrustBadgeDto): Promise<TrustBadge> {
    const siteId = this.siteService.getDefaultSiteId();
    const maxPosition = await this.trustBadgeRepo
      .createQueryBuilder('trustBadge')
      .select('MAX(trustBadge.position)', 'max')
      .where('trustBadge.siteId = :siteId', { siteId })
      .getRawOne<{ max: number | null }>();
    const badge = await this.trustBadgeRepo.save(
      this.trustBadgeRepo.create({
        siteId,
        name: dto.name,
        url: dto.url,
        imageMediaId: dto.imageMediaId,
        position: (maxPosition?.max ?? -1) + 1,
        status: PublishStatus.DRAFT,
      }),
    );
    await this.media.attach(badge.imageMediaId!, ENTITY_TYPE, badge.id);
    await this.invalidatePublicCache();
    return badge;
  }

  async findAll(status?: PublishStatus): Promise<TrustBadge[]> {
    return this.trustBadgeRepo.find({
      where: {
        siteId: this.siteService.getDefaultSiteId(),
        ...(status ? { status } : {}),
      },
      order: { position: 'ASC' },
    });
  }

  async findOne(id: string): Promise<TrustBadge> {
    return this.trustBadgeRepo.findOneByOrFail({ id });
  }

  async update(id: string, dto: UpdateTrustBadgeDto): Promise<TrustBadge> {
    const badge = await this.findOne(id);
    const previousMediaId = badge.imageMediaId;
    if (dto.name !== undefined) badge.name = dto.name;
    if (dto.url !== undefined) badge.url = dto.url ?? undefined;
    if (dto.imageMediaId !== undefined) {
      badge.imageMediaId = dto.imageMediaId ?? undefined;
    }
    const saved = await this.trustBadgeRepo.save(badge);
    if (dto.imageMediaId !== undefined && dto.imageMediaId !== previousMediaId) {
      if (previousMediaId) {
        await this.media.detach(previousMediaId, ENTITY_TYPE, saved.id);
      }
      if (saved.imageMediaId) {
        await this.media.attach(saved.imageMediaId, ENTITY_TYPE, saved.id);
      }
    }
    await this.invalidatePublicCache();
    return saved;
  }

  async remove(id: string): Promise<void> {
    const badge = await this.findOne(id);
    if (badge.imageMediaId) {
      await this.media.detach(badge.imageMediaId, ENTITY_TYPE, badge.id);
    }
    await this.trustBadgeRepo.delete({ id });
    await this.invalidatePublicCache();
  }

  async updateStatus(id: string, to: PublishStatus): Promise<TrustBadge> {
    const badge = await this.findOne(id);
    await this.publishing.transition({
      from: badge.status,
      to,
      entityType: ENTITY_TYPE,
      entityId: badge.id,
      siteId: badge.siteId,
    });
    badge.status = to;
    const saved = await this.trustBadgeRepo.save(badge);
    await this.invalidatePublicCache();
    return saved;
  }

  async reorder(orderedIds: string[]): Promise<void> {
    await this.ordering.reorder(
      this.trustBadgeRepo.manager,
      'trust_badges',
      orderedIds,
    );
    await this.invalidatePublicCache();
  }

  private async invalidatePublicCache(): Promise<void> {
    await this.redis.delete(PUBLIC_LIST_CACHE_KEY);
  }
}
