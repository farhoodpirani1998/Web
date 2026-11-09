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
import { TrustBadgesService } from './trust-badges.service';
import { CreateTrustBadgeDto } from './dto/create-trust-badge.dto';
import { UpdateTrustBadgeDto } from './dto/update-trust-badge.dto';
import { UpdateTrustBadgeStatusDto } from './dto/update-trust-badge-status.dto';
import { ReorderTrustBadgesDto } from './dto/reorder-trust-badges.dto';
import { RequireCmsPermission } from '../../identity/auth/cms-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

@Controller('admin/trust-badges')
export class TrustBadgesController {
  constructor(private readonly trustBadgesService: TrustBadgesService) {}

  @Get()
  @RequireCmsPermission(WebsitePermission.CONTENT_READ)
  findAll(@Query('status') status?: PublishStatus) {
    return this.trustBadgesService.findAll(status);
  }

  @Get(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_READ)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.trustBadgesService.findOne(id);
  }

  @Post()
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  create(@Body() dto: CreateTrustBadgeDto) {
    return this.trustBadgesService.create(dto);
  }

  @Patch('reorder')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  reorder(@Body() dto: ReorderTrustBadgesDto) {
    return this.trustBadgesService.reorder(dto.orderedIds);
  }

  @Patch(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTrustBadgeDto,
  ) {
    return this.trustBadgesService.update(id, dto);
  }

  @Patch(':id/status')
  @RequireCmsPermission(WebsitePermission.CONTENT_PUBLISH)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTrustBadgeStatusDto,
  ) {
    return this.trustBadgesService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.trustBadgesService.remove(id);
  }
}
