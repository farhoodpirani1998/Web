import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { HeroService } from './hero.service';
import { CreateHeroSlideDto } from './dto/create-hero-slide.dto';
import { UpdateHeroSlideDto } from './dto/update-hero-slide.dto';
import { UpdateHeroSlideStatusDto } from './dto/update-hero-slide-status.dto';
import { ReorderHeroSlidesDto } from './dto/reorder-hero-slides.dto';
import { RequireCmsPermission } from '../../identity/auth/cms-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';
import { CurrentAdmin } from '../../identity/auth/current-admin.decorator';
import { CmsRequestUser } from '../../identity/auth/cms-jwt-payload.interface';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

/**
 * Admin CRUD for the homepage hero carousel. As with FAQ/Testimonials,
 * the public read path belongs to the public-api layer, not here.
 */
@Controller('admin/hero-slides')
export class HeroController {
  constructor(private readonly heroService: HeroService) {}

  @Get()
  @RequireCmsPermission(WebsitePermission.CONTENT_READ)
  findAll(@Query('status') status?: PublishStatus) {
    return this.heroService.findAll(status);
  }

  @Get(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_READ)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.heroService.findOne(id);
  }

  @Get(':id/revisions')
  @RequireCmsPermission(WebsitePermission.REVISIONS_VIEW)
  listRevisions(@Param('id', ParseUUIDPipe) id: string) {
    return this.heroService.listRevisions(id);
  }

  @Post()
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  create(@Body() dto: CreateHeroSlideDto, @CurrentAdmin() user: CmsRequestUser) {
    return this.heroService.create(dto, user.id);
  }

  @Patch('reorder')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  reorder(@Body() dto: ReorderHeroSlidesDto) {
    return this.heroService.reorder(dto.orderedIds);
  }

  @Patch(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHeroSlideDto,
    @CurrentAdmin() user: CmsRequestUser,
  ) {
    return this.heroService.update(id, dto, user.id);
  }

  @Patch(':id/status')
  @RequireCmsPermission(WebsitePermission.CONTENT_PUBLISH)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHeroSlideStatusDto,
  ) {
    return this.heroService.updateStatus(id, dto.status);
  }

  @Post(':id/revisions/:versionNumber/restore')
  @RequireCmsPermission(WebsitePermission.REVISIONS_RESTORE)
  restoreRevision(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('versionNumber', ParseIntPipe) versionNumber: number,
    @CurrentAdmin() user: CmsRequestUser,
  ) {
    return this.heroService.restoreRevision(id, versionNumber, user.id);
  }

  @Delete(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.heroService.remove(id);
  }
}
