import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial } from './entities/testimonial.entity';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { SiteService } from '../../core/site/site.service';
import { OrderingService } from '../../core/ordering/ordering.service';
import { PublishingService } from '../../core/publishing/publishing.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { MediaService } from '../../core/media/media.service';
import { RedisService } from '../../core/redis/redis.service';
import { buildPublicCacheKey } from '../../public-api/common/public-cache.constants';

const ENTITY_TYPE = 'testimonial';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepo: Repository<Testimonial>,
    private readonly siteService: SiteService,
    private readonly ordering: OrderingService,
    private readonly publishing: PublishingService,
    private readonly media: MediaService,
    private readonly redis: RedisService,
  ) {}

  async create(dto: CreateTestimonialDto): Promise<Testimonial> {
    const siteId = this.siteService.getDefaultSiteId();
    const maxPosition = await this.testimonialRepo
      .createQueryBuilder('testimonial')
      .select('MAX(testimonial.position)', 'max')
      .where('testimonial.siteId = :siteId', { siteId })
      .getRawOne<{ max: number | null }>();

    const testimonial = await this.testimonialRepo.save(
      this.testimonialRepo.create({
        siteId,
        authorName: dto.authorName,
        authorRole: dto.authorRole,
        content: dto.content,
        rating: dto.rating,
        avatarMediaId: dto.avatarMediaId,
        position: (maxPosition?.max ?? -1) + 1,
        status: PublishStatus.DRAFT,
      }),
    );

    if (testimonial.avatarMediaId) {
      await this.media.attach(
        testimonial.avatarMediaId,
        ENTITY_TYPE,
        testimonial.id,
      );
    }
    await this.invalidatePublicCache();
    return testimonial;
  }

  async findAll(status?: PublishStatus): Promise<Testimonial[]> {
    const siteId = this.siteService.getDefaultSiteId();
    return this.testimonialRepo.find({
      where: { siteId, ...(status ? { status } : {}) },
      order: { position: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Testimonial> {
    return this.testimonialRepo.findOneByOrFail({ id });
  }

  async update(id: string, dto: UpdateTestimonialDto): Promise<Testimonial> {
    const testimonial = await this.findOne(id);
    const previousAvatarMediaId = testimonial.avatarMediaId;

    if (dto.authorName !== undefined) testimonial.authorName = dto.authorName;
    if (dto.authorRole !== undefined) testimonial.authorRole = dto.authorRole;
    if (dto.content !== undefined) testimonial.content = dto.content;
    if (dto.rating !== undefined) testimonial.rating = dto.rating;
    if (dto.avatarMediaId !== undefined) {
      testimonial.avatarMediaId = dto.avatarMediaId ?? undefined;
    }

    const saved = await this.testimonialRepo.save(testimonial);

    // Keep MediaUsage in sync only when the avatar actually changed —
    // avoids redundant attach/detach churn on every unrelated field edit.
    if (
      dto.avatarMediaId !== undefined &&
      dto.avatarMediaId !== previousAvatarMediaId
    ) {
      if (previousAvatarMediaId) {
        await this.media.detach(previousAvatarMediaId, ENTITY_TYPE, saved.id);
      }
      if (saved.avatarMediaId) {
        await this.media.attach(saved.avatarMediaId, ENTITY_TYPE, saved.id);
      }
    }

    await this.invalidatePublicCache();
    return saved;
  }

  async remove(id: string): Promise<void> {
    const testimonial = await this.findOne(id);
    if (testimonial.avatarMediaId) {
      await this.media.detach(
        testimonial.avatarMediaId,
        ENTITY_TYPE,
        testimonial.id,
      );
    }
    await this.testimonialRepo.delete({ id });
    await this.invalidatePublicCache();
  }

  async updateStatus(id: string, to: PublishStatus): Promise<Testimonial> {
    const testimonial = await this.findOne(id);
    this.publishing.transition({
      from: testimonial.status,
      to,
      entityType: ENTITY_TYPE,
      entityId: testimonial.id,
      siteId: testimonial.siteId,
    });
    testimonial.status = to;
    const saved = await this.testimonialRepo.save(testimonial);
    await this.invalidatePublicCache();
    return saved;
  }

  async reorder(orderedIds: string[]): Promise<void> {
    await this.ordering.reorder(
      this.testimonialRepo.manager,
      'testimonials',
      orderedIds,
    );
    await this.invalidatePublicCache();
  }

  /** Clears every cached variant of this module's public list after a write. */
  private async invalidatePublicCache(): Promise<void> {
    await this.redis.deleteByPrefix(
      `${buildPublicCacheKey('testimonials', 'list')}:`,
    );
  }
}
