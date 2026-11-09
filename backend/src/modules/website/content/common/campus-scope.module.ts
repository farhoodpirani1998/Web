import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campus } from '../campuses/entities/campus.entity';
import { CampusScopeService } from './campus-scope.service';

@Module({
  imports: [TypeOrmModule.forFeature([Campus])],
  providers: [CampusScopeService],
  exports: [CampusScopeService],
})
export class CampusScopeModule {}
