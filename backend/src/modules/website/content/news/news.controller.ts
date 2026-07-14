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
import { RequireWebsitePermission } from '../../auth/website-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';
import { CurrentWebsiteUser, WebsiteRequestUser } from '../../auth/current-website-user.decorator';
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
  @RequireWebsitePermission(WebsitePermission.CONTENT_READ)
  findAll(@Query('status') status?: PublishStatus, @Query('category') category?: string) {
    return this.newsService.findAll(status, category);
  }

  @Get(':id')
  @RequireWebsitePermission(WebsitePermission.CONTENT_READ)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsService.findOne(id);
  }

  @Get(':id/revisions')
  @RequireWebsitePermission(WebsitePermission.REVISIONS_VIEW)
  listRevisions(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsService.listRevisions(id);
  }

  @Post()
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  create(
    @Body() dto: CreateNewsArticleDto,
    @CurrentWebsiteUser() user: WebsiteRequestUser,
  ) {
    return this.newsService.create(dto, user.externalUserId);
  }

  @Patch(':id')
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNewsArticleDto,
    @CurrentWebsiteUser() user: WebsiteRequestUser,
  ) {
    return this.newsService.update(id, dto, user.externalUserId);
  }

  @Patch(':id/status')
  @RequireWebsitePermission(WebsitePermission.CONTENT_PUBLISH)
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
  @RequireWebsitePermission(WebsitePermission.CONTENT_PUBLISH)
  schedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ScheduleNewsArticleDto,
  ) {
    return this.newsService.schedule(id, dto.publishAt);
  }

  @Post(':id/revisions/:versionNumber/restore')
  @RequireWebsitePermission(WebsitePermission.REVISIONS_RESTORE)
  restoreRevision(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('versionNumber', ParseIntPipe) versionNumber: number,
    @CurrentWebsiteUser() user: WebsiteRequestUser,
  ) {
    return this.newsService.restoreRevision(id, versionNumber, user.externalUserId);
  }

  @Delete(':id')
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsService.remove(id);
  }
}
