import { IsDateString, IsOptional } from 'class-validator';

/**
 * Dedicated action DTO, same idiom as UpdatePageStatusDto — identical
 * to News' ScheduleNewsArticleDto. `publishAt: null` explicitly clears
 * a schedule; omitting the field entirely is not a valid request for
 * this endpoint.
 */
export class SchedulePageDto {
  @IsOptional()
  @IsDateString()
  publishAt!: string | null;
}
