import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogModule } from '../../core/audit-log/audit-log.module';
import { SiteModule } from '../../core/site/site.module';
import { CmsAuthModule } from '../../identity/auth/cms-auth.module';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { NewsletterSubscriber } from './entities/newsletter-subscriber.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NewsletterSubscriber]),
    AuditLogModule,
    SiteModule,
    CmsAuthModule,
  ],
  providers: [NewsletterService],
  controllers: [NewsletterController],
  exports: [NewsletterService],
})
export class NewsletterModule {}
