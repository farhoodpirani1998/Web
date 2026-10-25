import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from './entities/achievement.entity';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { SiteService } from '../../core/site/site.service';
import { OrderingService } from '../../core/ordering/ordering.service';
import { PublishingService } from '../../core/publishing/publishing.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { RedisService } from '../../core/redis/redis.service';
import { buildPublicCacheKey } from '../../public-api/common/public-cache.constants';

const ENTITY_TYPE = 'achievement';
const TABLE_NAME = 'achievements';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(Achievement)
    private readonly achievementsRepo: Repository<Achievement>,
    private readonly siteService: SiteService,
    private readonly ordering: OrderingService,
    private readonly publishing: PublishingService,
    private readonly redis: RedisService,
  ) {}

  async create(dto: CreateAchievementDto): Promise<Achievement> {
    const siteId = this.siteService.getDefaultSiteId();
    const maxPosition = await this.achievementsRepo
      .createQueryBuilder('achievement')
      .select('MAX(achievement.position)', 'max')
      .where('achievement.siteId = :siteId', { siteId })
      .getRawOne<{ max: number | null }>();

    const created = await this.achievementsRepo.save(
      this.achievementsRepo.create({
        siteId,
        value: dto.value,
        label: dto.label,
        icon: dto.icon,
        position: (maxPosition?.max ?? -1) + 1,
        status: PublishStatus.DRAFT,
      }),
    );
    await this.invalidatePublicCache();
    return created;
  }

  async findAll(status?: PublishStatus): Promise<Achievement[]> {
    const siteId = this.siteService.getDefaultSiteId();
    return this.achievementsRepo.find({
      where: { siteId, ...(status ? { status } : {}) },
      order: { position: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Achievement> {
    return this.achievementsRepo.findOneByOrFail({ id });
  }

  async update(id: string, dto: UpdateAchievementDto): Promise<Achievement> {
    const achievement = await this.findOne(id);
    if (dto.value !== undefined) achievement.value = dto.value;
    if (dto.label !== undefined) achievement.label = dto.label;
    if (dto.icon !== undefined) achievement.icon = dto.icon ?? undefined;
    const saved = await this.achievementsRepo.save(achievement);
    await this.invalidatePublicCache();
    return saved;
  }

  async remove(id: string): Promise<void> {
    await this.achievementsRepo.delete({ id });
    await this.invalidatePublicCache();
  }

  async updateStatus(id: string, to: PublishStatus): Promise<Achievement> {
    const achievement = await this.findOne(id);
    this.publishing.transition({
      from: achievement.status,
      to,
      entityType: ENTITY_TYPE,
      entityId: achievement.id,
      siteId: achievement.siteId,
    });
    achievement.status = to;
    const saved = await this.achievementsRepo.save(achievement);
    await this.invalidatePublicCache();
    return saved;
  }

  async reorder(orderedIds: string[]): Promise<void> {
    await this.ordering.reorder(
      this.achievementsRepo.manager,
      TABLE_NAME,
      orderedIds,
    );
    await this.invalidatePublicCache();
  }

  /** Clears every cached variant of this module's public list after a write. */
  private async invalidatePublicCache(): Promise<void> {
    await this.redis.deleteByPrefix(
      `${buildPublicCacheKey('achievements', 'list')}:`,
    );
  }
}
