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
import { StatisticsService } from './statistics.service';
import { CreateStatisticDto } from './dto/create-statistic.dto';
import { UpdateStatisticDto } from './dto/update-statistic.dto';
import { UpdateStatisticStatusDto } from './dto/update-statistic-status.dto';
import { ReorderStatisticsDto } from './dto/reorder-statistics.dto';
import { RequireWebsitePermission } from '../../auth/website-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

/**
 * Admin CRUD for the statistics/counters section. As with Features and
 * Testimonials, the public, unauthenticated read path belongs to the
 * public-api layer, not here.
 *
 * `reorder` is registered before the `:id` routes for the same reason
 * FeaturesController does — otherwise Nest would try to parse the
 * literal segment "reorder" as a `:id` UUID.
 */
@Controller('admin/statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @RequireWebsitePermission(WebsitePermission.CONTENT_READ)
  findAll(@Query('status') status?: PublishStatus) {
    return this.statisticsService.findAll(status);
  }

  @Get(':id')
  @RequireWebsitePermission(WebsitePermission.CONTENT_READ)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.statisticsService.findOne(id);
  }

  @Post()
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  create(@Body() dto: CreateStatisticDto) {
    return this.statisticsService.create(dto);
  }

  @Patch('reorder')
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  reorder(@Body() dto: ReorderStatisticsDto) {
    return this.statisticsService.reorder(dto.orderedIds);
  }

  @Patch(':id')
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStatisticDto) {
    return this.statisticsService.update(id, dto);
  }

  @Patch(':id/status')
  @RequireWebsitePermission(WebsitePermission.CONTENT_PUBLISH)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatisticStatusDto,
  ) {
    return this.statisticsService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.statisticsService.remove(id);
  }
}
