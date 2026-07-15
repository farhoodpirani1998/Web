import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { PortalLinksService } from './portal-links.service';
import { CreatePortalLinkDto } from './dto/create-portal-link.dto';
import { UpdatePortalLinkDto } from './dto/update-portal-link.dto';
import { ReorderPortalLinksDto } from './dto/reorder-portal-links.dto';
import { RequireWebsitePermission } from '../../auth/website-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';

/**
 * Admin CRUD for Portal Links. Same admin-only, permission-gated shape
 * as FeaturesController — the public read path is Phase 3+ scope.
 */
@Controller('admin/portal-links')
export class PortalLinksController {
  constructor(private readonly portalLinksService: PortalLinksService) {}

  @Get()
  @RequireWebsitePermission(WebsitePermission.CONTENT_READ)
  findAll() {
    return this.portalLinksService.findAll();
  }

  @Get(':id')
  @RequireWebsitePermission(WebsitePermission.CONTENT_READ)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.portalLinksService.findOne(id);
  }

  @Post()
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  create(@Body() dto: CreatePortalLinkDto) {
    return this.portalLinksService.create(dto);
  }

  // Declared ahead of the ':id' routes below so the literal path
  // segment "reorder" isn't swallowed by the ':id' param route — same
  // ordering idiom as FeaturesController/MenuItemsController.
  @Patch('reorder')
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  reorder(@Body() dto: ReorderPortalLinksDto) {
    return this.portalLinksService.reorder(dto.orderedIds);
  }

  @Patch(':id')
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePortalLinkDto) {
    return this.portalLinksService.update(id, dto);
  }

  @Delete(':id')
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.portalLinksService.remove(id);
  }
}
