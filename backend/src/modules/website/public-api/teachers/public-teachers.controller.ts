import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Throttle } from '@nestjs/throttler';
import { Repository } from 'typeorm';
import { Teacher } from '../../content/teachers/entities/teacher.entity';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { SiteService } from '../../core/site/site.service';
import { PublicVisibilityService } from '../common/public-visibility.service';
import {
  PublicMediaService,
  PublicMediaRef,
} from '../common/public-media.service';
import {
  PUBLIC_THROTTLE,
  PUBLIC_CACHE_CONTROL,
} from '../common/public-rate-limit.constants';

interface PublicTeacherListItemDto {
  id: string;
  fullName: string;
  slug: string;
  jobTitle: Teacher['jobTitle'];
  excerpt?: Teacher['excerpt'];
  department?: Teacher['department'];
  campusId?: string;
  phone?: string;
  email?: string;
  position: number;
  avatar: PublicMediaRef | null;
}

interface PublicTeacherDetailDto extends PublicTeacherListItemDto {
  bio: Teacher['bio'];
  seo: Teacher['seo'];
  updatedAt: Date;
}

/**
 * Core section, not feature-flag gated (see the Teacher entity's doc
 * comment) — the list route follows PublicCampusesController's shape
 * (position-ordered, no pagination, no feature-flag check: a small
 * curated set of teachers, not a growing feed), with an optional
 * `?campusId=` filter for a per-campus staff listing. Each teacher is
 * also its own indexable page though, so `:slug` follows
 * PublicCampusesController/PublicNewsController's shape instead
 * (visibility check, media resolution, 404 on a missing/unpublished
 * slug).
 */
@Throttle(PUBLIC_THROTTLE)
@Controller('public/teachers')
export class PublicTeachersController {
  constructor(
    @InjectRepository(Teacher)
    private readonly teachersRepo: Repository<Teacher>,
    private readonly siteService: SiteService,
    private readonly visibility: PublicVisibilityService,
    private readonly media: PublicMediaService,
  ) {}

  @Header('Cache-Control', PUBLIC_CACHE_CONTROL)
  @Get()
  async findAll(
    @Query('campusId') campusId?: string,
  ): Promise<PublicTeacherListItemDto[]> {
    const siteId = this.siteService.getDefaultSiteId();
    const where: Record<string, unknown> = {
      siteId,
      status: PublishStatus.PUBLISHED,
    };
    if (campusId) where.campusId = campusId;

    const teachers = await this.teachersRepo.find({
      where,
      order: { position: 'ASC' },
    });
    const visible = this.visibility.filterVisible(teachers);

    const mediaMap = await this.media.resolveMany(
      visible.map((teacher) => teacher.avatarMediaId),
    );

    return visible.map((teacher) => this.toListItem(teacher, mediaMap));
  }

  @Header('Cache-Control', PUBLIC_CACHE_CONTROL)
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string): Promise<PublicTeacherDetailDto> {
    const siteId = this.siteService.getDefaultSiteId();
    const teacher = await this.teachersRepo.findOne({ where: { siteId, slug } });
    if (!teacher || !this.visibility.isVisible(teacher)) {
      throw new NotFoundException(`Teacher "${slug}" not found`);
    }

    const avatar = await this.media.resolveOne(teacher.avatarMediaId);
    return {
      ...this.toListItem(teacher, new Map()),
      avatar,
      bio: teacher.bio,
      seo: teacher.seo,
      updatedAt: teacher.updatedAt,
    };
  }

  private toListItem(
    teacher: Teacher,
    mediaMap: Map<string, PublicMediaRef>,
  ): PublicTeacherListItemDto {
    return {
      id: teacher.id,
      fullName: teacher.fullName,
      slug: teacher.slug,
      jobTitle: teacher.jobTitle,
      excerpt: teacher.excerpt,
      department: teacher.department,
      campusId: teacher.campusId,
      phone: teacher.phone,
      email: teacher.email,
      position: teacher.position,
      avatar: teacher.avatarMediaId
        ? (mediaMap.get(teacher.avatarMediaId) ?? null)
        : null,
    };
  }
}
