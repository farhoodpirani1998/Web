import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectLiteral, SelectQueryBuilder, Repository } from 'typeorm';
import { Campus } from '../campuses/entities/campus.entity';

@Injectable()
export class CampusScopeService {
  constructor(
    @InjectRepository(Campus)
    private readonly campusesRepo: Repository<Campus>,
  ) {}

  async assertCampusBelongsToSite(
    siteId: string,
    campusId?: string | null,
  ): Promise<void> {
    if (!campusId) return;

    const campus = await this.campusesRepo.findOne({
      where: { id: campusId, siteId },
      select: { id: true },
    });
    if (!campus) {
      throw new BadRequestException(
        'campusId must identify a campus on this site',
      );
    }
  }

  applyPublicFilter<T extends ObjectLiteral>(
    query: SelectQueryBuilder<T>,
    alias: string,
    campusId?: string,
  ): SelectQueryBuilder<T> {
    if (campusId) {
      query.andWhere(
        `(${alias}.campusId = :campusId OR ${alias}.campusId IS NULL)`,
        { campusId },
      );
    }
    return query;
  }
}
