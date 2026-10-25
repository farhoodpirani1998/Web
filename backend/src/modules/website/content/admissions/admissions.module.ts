import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdmissionEntry } from './entities/admission-entry.entity';
import { AdmissionsService } from './admissions.service';
import { AdmissionsController } from './admissions.controller';
import { SiteModule } from '../../core/site/site.module';
import { OrderingModule } from '../../core/ordering/ordering.module';
import { PublishingModule } from '../../core/publishing/publishing.module';
import { CmsAuthModule } from '../../identity/auth/cms-auth.module';
import { RedisModule } from '../../core/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdmissionEntry]),
    SiteModule,
    OrderingModule,
    PublishingModule,
    CmsAuthModule,
    RedisModule,
  ],
  providers: [AdmissionsService],
  controllers: [AdmissionsController],
  exports: [AdmissionsService],
})
export class AdmissionsModule {}
