import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto';
import { UpdateGalleryItemStatusDto } from './dto/update-gallery-item-status.dto';
import { ReorderGalleryItemsDto } from './dto/reorder-gallery-items.dto';
import { RequireWebsitePermission } from '../../auth/website-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

/**
 * Admin CRUD for the photo gallery. As with FAQ and Testimonials, the
 * public, unauthenticated read path belongs to the public-api layer,
 * not here.
 */
@Controller('admin/gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  @RequireWebsitePermission(WebsitePermission.CONTENT_READ)
  findAll(@Query('status') status?: PublishStatus) {
    return this.galleryService.findAll(status);
  }

  @Get(':id')
  @RequireWebsitePermission(WebsitePermission.CONTENT_READ)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.galleryService.findOne(id);
  }

  @Post()
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  create(@Body() dto: CreateGalleryItemDto) {
    return this.galleryService.create(dto);
  }

  @Patch('reorder')
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  reorder(@Body() dto: ReorderGalleryItemsDto) {
    return this.galleryService.reorder(dto.orderedIds);
  }

  @Patch(':id')
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateGalleryItemDto) {
    return this.galleryService.update(id, dto);
  }

  @Patch(':id/status')
  @RequireWebsitePermission(WebsitePermission.CONTENT_PUBLISH)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGalleryItemStatusDto,
  ) {
    return this.galleryService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.galleryService.remove(id);
  }
}
