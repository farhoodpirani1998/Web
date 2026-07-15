import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Statistic } from './entities/statistic.entity';
import { CreateStatisticDto } from './dto/create-statistic.dto';
import { UpdateStatisticDto } from './dto/update-statistic.dto';
import { SiteService } from '../../core/site/site.service';
import { OrderingService } from '../../core/ordering/ordering.service';
import { PublishingService } from '../../core/publishing/publishing.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

const ENTITY_TYPE = 'statistic';
const TABLE_NAME = 'statistics';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Statistic)
    private readonly statisticsRepo: Repository<Statistic>,
    private readonly siteService: SiteService,
    private readonly ordering: OrderingService,
    private readonly publishing: PublishingService,
  ) {}

  async create(dto: CreateStatisticDto): Promise<Statistic> {
    const siteId = this.siteService.getDefaultSiteId();

    // New statistics are appended to the end of the current display
    // order — same MAX(position)+1 idiom as FeaturesService.create.
    const maxPosition = await this.statisticsRepo
      .createQueryBuilder('statistic')
      .select('MAX(statistic.position)', 'max')
      .where('statistic.siteId = :siteId', { siteId })
      .getRawOne<{ max: number | null }>();

    return this.statisticsRepo.save(
      this.statisticsRepo.create({
        siteId,
        label: dto.label,
        value: dto.value,
        suffix: dto.suffix,
        icon: dto.icon,
        position: (maxPosition?.max ?? -1) + 1,
        status: PublishStatus.DRAFT,
      }),
    );
  }

  async findAll(status?: PublishStatus): Promise<Statistic[]> {
    const siteId = this.siteService.getDefaultSiteId();
    return this.statisticsRepo.find({
      where: { siteId, ...(status ? { status } : {}) },
      order: { position: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Statistic> {
    return this.statisticsRepo.findOneByOrFail({ id });
  }

  async update(id: string, dto: UpdateStatisticDto): Promise<Statistic> {
    const statistic = await this.findOne(id);
    if (dto.label !== undefined) statistic.label = dto.label;
    if (dto.value !== undefined) statistic.value = dto.value;
    if (dto.suffix !== undefined) statistic.suffix = dto.suffix ?? undefined;
    if (dto.icon !== undefined) statistic.icon = dto.icon ?? undefined;
    return this.statisticsRepo.save(statistic);
  }

  async remove(id: string): Promise<void> {
    await this.statisticsRepo.delete({ id });
  }

  async updateStatus(id: string, to: PublishStatus): Promise<Statistic> {
    const statistic = await this.findOne(id);
    this.publishing.transition({
      from: statistic.status,
      to,
      entityType: ENTITY_TYPE,
      entityId: statistic.id,
      siteId: statistic.siteId,
    });
    statistic.status = to;
    return this.statisticsRepo.save(statistic);
  }

  /** Same drag-and-drop reorder idiom as FeaturesService.reorder. */
  async reorder(orderedIds: string[]): Promise<void> {
    await this.ordering.reorder(this.statisticsRepo.manager, TABLE_NAME, orderedIds);
  }
}
