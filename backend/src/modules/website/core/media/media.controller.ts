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
  UnsupportedMediaTypeException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { MediaStatus } from './entities/media.entity';
import { ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES, MAX_SIZE_BYTES } from './media.constants';
import { RequireWebsitePermission } from '../../auth/website-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';

/**
 * Admin media library. The public read path is just serving the files
 * themselves back out (see main.ts `useStaticAssets` for the local
 * driver, or the S3-compatible provider's public URL for that driver) —
 * this controller only manages the Media rows and their storage objects.
 */
@Controller('admin/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @RequireWebsitePermission(WebsitePermission.MEDIA_MANAGE)
  findAll(@Query('status') status?: MediaStatus) {
    return this.mediaService.findAll(status);
  }

  @Get(':id')
  @RequireWebsitePermission(WebsitePermission.MEDIA_MANAGE)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.mediaService.findOne(id);
  }

  @Post()
  @RequireWebsitePermission(WebsitePermission.MEDIA_MANAGE)
  @UseInterceptors(
    FileInterceptor('file', {
      // Defense in depth: rejects an oversized file before it's fully
      // buffered, and rejects an obviously-wrong Content-Type or
      // extension before it ever reaches the service. MediaService
      // still re-checks all of these (plus the actual file bytes and
      // the extension/content-type cross-match) as the authoritative
      // check.
      limits: { fileSize: MAX_SIZE_BYTES },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype as (typeof ALLOWED_MIME_TYPES)[number])) {
          callback(
            new UnsupportedMediaTypeException(`Unsupported file type: ${file.mimetype}`),
            false,
          );
          return;
        }
        const extension = extname(file.originalname).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(extension as (typeof ALLOWED_EXTENSIONS)[number])) {
          callback(
            new UnsupportedMediaTypeException(`Unsupported file extension: ${extension || '(none)'}`),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File, @Body() dto: UploadMediaDto) {
    return this.mediaService.upload(file, dto.altText);
  }

  @Patch(':id/archive')
  @RequireWebsitePermission(WebsitePermission.MEDIA_MANAGE)
  archive(@Param('id', ParseUUIDPipe) id: string) {
    return this.mediaService.archive(id);
  }

  @Delete(':id')
  @RequireWebsitePermission(WebsitePermission.MEDIA_MANAGE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.mediaService.purge(id);
  }
}
