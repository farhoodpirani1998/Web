import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicCalendarEntry } from './entities/academic-calendar-entry.entity';
import { AcademicCalendarService } from './academic-calendar.service';
import { AcademicCalendarController } from './academic-calendar.controller';
import { SiteModule } from '../../core/site/site.module';
import { OrderingModule } from '../../core/ordering/ordering.module';
import { PublishingModule } from '../../core/publishing/publishing.module';
import { CmsAuthModule } from '../../identity/auth/cms-auth.module';
import { RedisModule } from '../../core/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AcademicCalendarEntry]),
    SiteModule,
    OrderingModule,
    PublishingModule,
    CmsAuthModule,
    RedisModule,
  ],
  providers: [AcademicCalendarService],
  controllers: [AcademicCalendarController],
  exports: [AcademicCalendarService],
})
export class AcademicCalendarModule {}
