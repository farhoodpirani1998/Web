import { IsDateString, IsOptional } from 'class-validator';

/**
 * Dedicated action DTO, same idiom as News/Events/Pages' ScheduleXDto —
 * a single-purpose endpoint rather than folding this into the generic
 * update. `publishAt: null` explicitly clears a schedule (unschedules
 * the campus's public page); omitting the field entirely is not a
 * valid request for this endpoint, since scheduling is its whole
 * purpose.
 */
export class ScheduleCampusDto {
  @IsOptional()
  @IsDateString()
  publishAt!: string | null;
}
