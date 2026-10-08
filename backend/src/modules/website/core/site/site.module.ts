import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from './entities/site.entity';
import { SiteService } from './site.service';

@Module({
  imports: [TypeOrmModule.forFeature([Site])],
  providers: [SiteService],
  exports: [SiteService],
})
export class SiteModule {}
