import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentRevision } from './entities/content-revision.entity';
import { RevisionsService } from './revisions.service';

@Module({
  imports: [TypeOrmModule.forFeature([ContentRevision])],
  providers: [RevisionsService],
  exports: [RevisionsService],
})
export class RevisionsModule {}
