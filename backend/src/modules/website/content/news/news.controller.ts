import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsArticleDto } from './dto/create-news-article.dto';
import { UpdateNewsArticleDto } from './dto/update-news-article.dto';
import { UpdateNewsArticleStatusDto } from './dto/update-news-article-status.dto';
import { ScheduleNewsArticleDto } from './dto/schedule-news-article.dto';
import { RequireCmsPermission } from '../../identity/auth/cms-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';
import { CurrentAdmin } from '../../identity/auth/current-admin.decorator';
import { CmsRequestUser } from '../../identity/auth/cms-jwt-payload.interface';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

/**
 * Admin CRUD for news/announcement articles. As with every other
 * content module here, the public, unauthenticated read path
 * (`/public/website/news`, individual `/news/:slug` pages) belongs to
 * the public-api layer (Phase 3+), not this admin controller.
 */
@Controller('admin/news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @RequireCmsPermission(WebsitePermission.CONTENT_READ)
  findAll(@Query('status') status?: PublishStatus, @Query('category') category?: string) {
    return this.newsService.findAll(status, category);
  }

  @Get(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_READ)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsService.findOne(id);
  }

  @Get(':id/revisions')
  @RequireCmsPermission(WebsitePermission.REVISIONS_VIEW)
  listRevisions(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsService.listRevisions(id);
  }

  @Post()
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  create(
    @Body() dto: CreateNewsArticleDto,
    @CurrentAdmin() user: CmsRequestUser,
  ) {
    return this.newsService.create(dto, user.id);
  }

  @Patch(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNewsArticleDto,
    @CurrentAdmin() user: CmsRequestUser,
  ) {
    return this.newsService.update(id, dto, user.id);
  }

  @Patch(':id/status')
  @RequireCmsPermission(WebsitePermission.CONTENT_PUBLISH)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNewsArticleStatusDto,
  ) {
    return this.newsService.updateStatus(id, dto.status);
  }

  // Distinct from `status`: gates when a PUBLISHED article actually
  // becomes visible (sitemap today; public API in Phase 3+). Gated by
  // the same permission as status changes — deciding *when* something
  // goes live is a publishing decision, not a content-editing one.
  @Patch(':id/schedule')
  @RequireCmsPermission(WebsitePermission.CONTENT_PUBLISH)
  schedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ScheduleNewsArticleDto,
  ) {
    return this.newsService.schedule(id, dto.publishAt);
  }

  @Post(':id/revisions/:versionNumber/restore')
  @RequireCmsPermission(WebsitePermission.REVISIONS_RESTORE)
  restoreRevision(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('versionNumber', ParseIntPipe) versionNumber: number,
    @CurrentAdmin() user: CmsRequestUser,
  ) {
    return this.newsService.restoreRevision(id, versionNumber, user.id);
  }

  @Delete(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsService.remove(id);
  }
}
