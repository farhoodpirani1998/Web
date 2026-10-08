import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GalleryItem } from './entities/gallery-item.entity';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto';
import { SiteService } from '../../core/site/site.service';
import { OrderingService } from '../../core/ordering/ordering.service';
import { PublishingService } from '../../core/publishing/publishing.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { MediaService } from '../../core/media/media.service';

const ENTITY_TYPE = 'gallery_item';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(GalleryItem)
    private readonly galleryRepo: Repository<GalleryItem>,
    private readonly siteService: SiteService,
    private readonly ordering: OrderingService,
    private readonly publishing: PublishingService,
    private readonly media: MediaService,
  ) {}

  async create(dto: CreateGalleryItemDto): Promise<GalleryItem> {
    const siteId = this.siteService.getDefaultSiteId();
    const maxPosition = await this.galleryRepo
      .createQueryBuilder('galleryItem')
      .select('MAX(galleryItem.position)', 'max')
      .where('galleryItem.siteId = :siteId', { siteId })
      .getRawOne<{ max: number | null }>();

    const item = await this.galleryRepo.save(
      this.galleryRepo.create({
        siteId,
        imageMediaId: dto.imageMediaId,
        caption: dto.caption,
        category: dto.category,
        position: (maxPosition?.max ?? -1) + 1,
        status: PublishStatus.DRAFT,
      }),
    );

    // Unlike Testimonial's avatar, imageMediaId is required — attach
    // unconditionally rather than guarding on presence.
    await this.media.attach(item.imageMediaId, ENTITY_TYPE, item.id);
    return item;
  }

  async findAll(status?: PublishStatus): Promise<GalleryItem[]> {
    const siteId = this.siteService.getDefaultSiteId();
    return this.galleryRepo.find({
      where: { siteId, ...(status ? { status } : {}) },
      order: { position: 'ASC' },
    });
  }

  async findOne(id: string): Promise<GalleryItem> {
    return this.galleryRepo.findOneByOrFail({ id });
  }

  async update(id: string, dto: UpdateGalleryItemDto): Promise<GalleryItem> {
    const item = await this.findOne(id);
    const previousImageMediaId = item.imageMediaId;

    if (dto.imageMediaId !== undefined) item.imageMediaId = dto.imageMediaId;
    if (dto.caption !== undefined) item.caption = dto.caption;
    if (dto.category !== undefined) item.category = dto.category;

    const saved = await this.galleryRepo.save(item);

    // Keep MediaUsage in sync only when the image actually changed —
    // avoids redundant attach/detach churn on every unrelated field edit.
    if (dto.imageMediaId !== undefined && dto.imageMediaId !== previousImageMediaId) {
      await this.media.detach(previousImageMediaId, ENTITY_TYPE, saved.id);
      await this.media.attach(saved.imageMediaId, ENTITY_TYPE, saved.id);
    }

    return saved;
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.media.detach(item.imageMediaId, ENTITY_TYPE, item.id);
    await this.galleryRepo.delete({ id });
  }

  async updateStatus(id: string, to: PublishStatus): Promise<GalleryItem> {
    const item = await this.findOne(id);
    this.publishing.transition({
      from: item.status,
      to,
      entityType: ENTITY_TYPE,
      entityId: item.id,
      siteId: item.siteId,
    });
    item.status = to;
    return this.galleryRepo.save(item);
  }

  async reorder(orderedIds: string[]): Promise<void> {
    await this.ordering.reorder(this.galleryRepo.manager, 'gallery_items', orderedIds);
  }
}
