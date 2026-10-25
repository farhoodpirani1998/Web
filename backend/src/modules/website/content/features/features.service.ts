import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feature } from './entities/feature.entity';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { SiteService } from '../../core/site/site.service';
import { OrderingService } from '../../core/ordering/ordering.service';
import { PublishingService } from '../../core/publishing/publishing.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { RedisService } from '../../core/redis/redis.service';
import { buildPublicCacheKey } from '../../public-api/common/public-cache.constants';

const ENTITY_TYPE = 'feature';

@Injectable()
export class FeaturesService {
  constructor(
    @InjectRepository(Feature)
    private readonly featureRepo: Repository<Feature>,
    private readonly siteService: SiteService,
    private readonly ordering: OrderingService,
    private readonly publishing: PublishingService,
    private readonly redis: RedisService,
  ) {}

  async create(dto: CreateFeatureDto): Promise<Feature> {
    const siteId = this.siteService.getDefaultSiteId();
    const maxPosition = await this.featureRepo
      .createQueryBuilder('feature')
      .select('MAX(feature.position)', 'max')
      .where('feature.siteId = :siteId', { siteId })
      .getRawOne<{ max: number | null }>();

    const created = await this.featureRepo.save(
      this.featureRepo.create({
        siteId,
        title: dto.title,
        description: dto.description,
        icon: dto.icon,
        position: (maxPosition?.max ?? -1) + 1,
        status: PublishStatus.DRAFT,
      }),
    );
    await this.invalidatePublicCache();
    return created;
  }

  async findAll(status?: PublishStatus): Promise<Feature[]> {
    const siteId = this.siteService.getDefaultSiteId();
    return this.featureRepo.find({
      where: { siteId, ...(status ? { status } : {}) },
      order: { position: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Feature> {
    return this.featureRepo.findOneByOrFail({ id });
  }

  async update(id: string, dto: UpdateFeatureDto): Promise<Feature> {
    const feature = await this.findOne(id);
    if (dto.title !== undefined) feature.title = dto.title;
    if (dto.description !== undefined) feature.description = dto.description;
    if (dto.icon !== undefined) feature.icon = dto.icon;
    const saved = await this.featureRepo.save(feature);
    await this.invalidatePublicCache();
    return saved;
  }

  async remove(id: string): Promise<void> {
    await this.featureRepo.delete({ id });
    await this.invalidatePublicCache();
  }

  async updateStatus(id: string, to: PublishStatus): Promise<Feature> {
    const feature = await this.findOne(id);
    this.publishing.transition({
      from: feature.status,
      to,
      entityType: ENTITY_TYPE,
      entityId: feature.id,
      siteId: feature.siteId,
    });
    feature.status = to;
    const saved = await this.featureRepo.save(feature);
    await this.invalidatePublicCache();
    return saved;
  }

  async reorder(orderedIds: string[]): Promise<void> {
    await this.ordering.reorder(
      this.featureRepo.manager,
      'features',
      orderedIds,
    );
    await this.invalidatePublicCache();
  }

  /** Clears every cached variant of this module's public list after a write. */
  private async invalidatePublicCache(): Promise<void> {
    await this.redis.deleteByPrefix(
      `${buildPublicCacheKey('features', 'list')}:`,
    );
  }
}
