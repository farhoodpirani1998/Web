import {
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { RequireCmsPermission } from '../../identity/auth/cms-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';
import { NewsletterSubscribersQueryDto } from './dto/newsletter-subscribers-query.dto';
import { NewsletterService } from './newsletter.service';

function csvCell(value: string): string {
  const safeValue = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replace(/"/g, '""')}"`;
}

@Controller('admin/newsletter-subscribers')
@RequireCmsPermission(WebsitePermission.NEWSLETTER_MANAGE)
export class NewsletterController {
  constructor(private readonly newsletter: NewsletterService) {}

  @Get('stats')
  getStats() {
    return this.newsletter.getStats();
  }

  @Get('export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="newsletter-subscribers.csv"')
  async export(@Query() query: NewsletterSubscribersQueryDto): Promise<string> {
    const subscribers = await this.newsletter.findAll(query);
    const rows = [
      ['ایمیل', 'تاریخ عضویت'],
      ...subscribers.map((subscriber) => [
        subscriber.email,
        subscriber.createdAt.toISOString(),
      ]),
    ];
    return `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`;
  }

  @Get()
  findAll(@Query() query: NewsletterSubscribersQueryDto) {
    return this.newsletter.findAll(query);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsletter.remove(id);
  }
}
