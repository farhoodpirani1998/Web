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
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { RequireWebsitePermission } from '../../auth/website-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';

/**
 * Admin CRUD for navigation menu containers (e.g. "header", "footer").
 * As with every other content module here, the public, unauthenticated
 * read path belongs to the public-api layer (Phase 3+), not this admin
 * controller — every route below requires an authenticated,
 * permission-checked website admin.
 */
@Controller('admin/menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  @RequireWebsitePermission(WebsitePermission.CONTENT_READ)
  findAll() {
    return this.menusService.findAll();
  }

  @Get(':id')
  @RequireWebsitePermission(WebsitePermission.CONTENT_READ)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.menusService.findOne(id);
  }

  @Post()
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  create(@Body() dto: CreateMenuDto) {
    return this.menusService.create(dto);
  }

  @Patch(':id')
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMenuDto) {
    return this.menusService.update(id, dto);
  }

  @Delete(':id')
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.menusService.remove(id);
  }
}
