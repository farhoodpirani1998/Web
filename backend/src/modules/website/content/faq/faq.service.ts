import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from './entities/faq.entity';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { SiteService } from '../../core/site/site.service';
import { OrderingService } from '../../core/ordering/ordering.service';
import { PublishingService } from '../../core/publishing/publishing.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

const ENTITY_TYPE = 'faq';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq) private readonly faqRepo: Repository<Faq>,
    private readonly siteService: SiteService,
    private readonly ordering: OrderingService,
    private readonly publishing: PublishingService,
  ) {}

  async create(dto: CreateFaqDto): Promise<Faq> {
    const siteId = this.siteService.getDefaultSiteId();
    const maxPosition = await this.faqRepo
      .createQueryBuilder('faq')
      .select('MAX(faq.position)', 'max')
      .where('faq.siteId = :siteId', { siteId })
      .getRawOne<{ max: number | null }>();

    return this.faqRepo.save(
      this.faqRepo.create({
        siteId,
        question: dto.question,
        answer: dto.answer,
        category: dto.category,
        position: (maxPosition?.max ?? -1) + 1,
        status: PublishStatus.DRAFT,
      }),
    );
  }

  async findAll(status?: PublishStatus): Promise<Faq[]> {
    const siteId = this.siteService.getDefaultSiteId();
    return this.faqRepo.find({
      where: { siteId, ...(status ? { status } : {}) },
      order: { position: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Faq> {
    return this.faqRepo.findOneByOrFail({ id });
  }

  async update(id: string, dto: UpdateFaqDto): Promise<Faq> {
    const faq = await this.findOne(id);
    if (dto.question !== undefined) faq.question = dto.question;
    if (dto.answer !== undefined) faq.answer = dto.answer;
    if (dto.category !== undefined) faq.category = dto.category;
    return this.faqRepo.save(faq);
  }

  async remove(id: string): Promise<void> {
    await this.faqRepo.delete({ id });
  }

  async updateStatus(id: string, to: PublishStatus): Promise<Faq> {
    const faq = await this.findOne(id);
    this.publishing.transition({
      from: faq.status,
      to,
      entityType: ENTITY_TYPE,
      entityId: faq.id,
      siteId: faq.siteId,
    });
    faq.status = to;
    return this.faqRepo.save(faq);
  }

  async reorder(orderedIds: string[]): Promise<void> {
    await this.ordering.reorder(this.faqRepo.manager, 'faqs', orderedIds);
  }
}
