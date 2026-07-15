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
import { RequireWebsitePermission } from '../../auth/website-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';
import { CurrentWebsiteUser, WebsiteRequestUser } from '../../auth/current-website-user.decorator';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

/**
 * Admin CRUD for the homepage hero carousel. As with FAQ/Testimonials,
 * the public read path belongs to the public-api layer, not here.
 */
@Controller('admin/hero-slides')
export class HeroController {
  constructor(private readonly heroService: HeroService) {}

  @Get()
  @RequireWebsitePermission(WebsitePermission.CONTENT_READ)
  findAll(@Query('status') status?: PublishStatus) {
    return this.heroService.findAll(status);
  }

  @Get(':id')
  @RequireWebsitePermission(WebsitePermission.CONTENT_READ)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.heroService.findOne(id);
  }

  @Get(':id/revisions')
  @RequireWebsitePermission(WebsitePermission.REVISIONS_VIEW)
  listRevisions(@Param('id', ParseUUIDPipe) id: string) {
    return this.heroService.listRevisions(id);
  }

  @Post()
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  create(@Body() dto: CreateHeroSlideDto, @CurrentWebsiteUser() user: WebsiteRequestUser) {
    return this.heroService.create(dto, user.externalUserId);
  }

  @Patch('reorder')
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  reorder(@Body() dto: ReorderHeroSlidesDto) {
    return this.heroService.reorder(dto.orderedIds);
  }

  @Patch(':id')
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHeroSlideDto,
    @CurrentWebsiteUser() user: WebsiteRequestUser,
  ) {
    return this.heroService.update(id, dto, user.externalUserId);
  }

  @Patch(':id/status')
  @RequireWebsitePermission(WebsitePermission.CONTENT_PUBLISH)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHeroSlideStatusDto,
  ) {
    return this.heroService.updateStatus(id, dto.status);
  }

  @Post(':id/revisions/:versionNumber/restore')
  @RequireWebsitePermission(WebsitePermission.REVISIONS_RESTORE)
  restoreRevision(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('versionNumber', ParseIntPipe) versionNumber: number,
    @CurrentWebsiteUser() user: WebsiteRequestUser,
  ) {
    return this.heroService.restoreRevision(id, versionNumber, user.externalUserId);
  }

  @Delete(':id')
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.heroService.remove(id);
  }
}
