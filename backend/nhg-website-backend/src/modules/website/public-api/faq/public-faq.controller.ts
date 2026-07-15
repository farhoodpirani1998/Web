import { Controller, Get, Header, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Throttle } from '@nestjs/throttler';
import { Repository } from 'typeorm';
import { Faq } from '../../content/faq/entities/faq.entity';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { SiteService } from '../../core/site/site.service';
import { SiteSettingsService } from '../../content/site-settings/site-settings.service';
import { PublicVisibilityService } from '../common/public-visibility.service';
import {
  PUBLIC_THROTTLE,
  PUBLIC_CACHE_CONTROL,
} from '../common/public-rate-limit.constants';

interface PublicFaqDto {
  id: string;
  question: Faq['question'];
  answer: Faq['answer'];
  category?: string;
  position: number;
}

/** Optional section — gated by featureFlags.faqEnabled, empty list when disabled. */
@Throttle(PUBLIC_THROTTLE)
@Header('Cache-Control', PUBLIC_CACHE_CONTROL)
@Controller('public/faq')
export class PublicFaqController {
  constructor(
    @InjectRepository(Faq)
    private readonly faqRepo: Repository<Faq>,
    private readonly siteService: SiteService,
    private readonly visibility: PublicVisibilityService,
    private readonly siteSettings: SiteSettingsService,
  ) {}

  @Get()
  async findAll(@Query('category') category?: string): Promise<PublicFaqDto[]> {
    const settings = await this.siteSettings.get();
    if (!settings.featureFlags.faqEnabled) return [];

    const siteId = this.siteService.getDefaultSiteId();
    const qb = this.faqRepo
      .createQueryBuilder('faq')
      .where('faq.siteId = :siteId', { siteId })
      .andWhere('faq.status = :status', { status: PublishStatus.PUBLISHED });
    if (category) qb.andWhere('faq.category = :category', { category });

    const faqs = await qb.addOrderBy('faq.position', 'ASC').getMany();
    const visible = this.visibility.filterVisible(faqs);

    return visible.map((faq) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      position: faq.position,
    }));
  }
}
