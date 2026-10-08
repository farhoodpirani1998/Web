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
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { UpdateTestimonialStatusDto } from './dto/update-testimonial-status.dto';
import { ReorderTestimonialsDto } from './dto/reorder-testimonials.dto';
import { RequireCmsPermission } from '../../identity/auth/cms-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

/**
 * Admin CRUD for the testimonials carousel. As with FAQ, the public,
 * unauthenticated read path belongs to the public-api layer, not here.
 */
@Controller('admin/testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
  @RequireCmsPermission(WebsitePermission.CONTENT_READ)
  findAll(@Query('status') status?: PublishStatus) {
    return this.testimonialsService.findAll(status);
  }

  @Get(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_READ)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.testimonialsService.findOne(id);
  }

  @Post()
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  create(@Body() dto: CreateTestimonialDto) {
    return this.testimonialsService.create(dto);
  }

  @Patch('reorder')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  reorder(@Body() dto: ReorderTestimonialsDto) {
    return this.testimonialsService.reorder(dto.orderedIds);
  }

  @Patch(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTestimonialDto) {
    return this.testimonialsService.update(id, dto);
  }

  @Patch(':id/status')
  @RequireCmsPermission(WebsitePermission.CONTENT_PUBLISH)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTestimonialStatusDto,
  ) {
    return this.testimonialsService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.testimonialsService.remove(id);
  }
}
