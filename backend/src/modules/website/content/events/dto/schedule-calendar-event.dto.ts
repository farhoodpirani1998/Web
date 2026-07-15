import { IsDateString, IsOptional } from 'class-validator';

/**
 * Dedicated action DTO, same idiom as News/Pages' ScheduleXDto — a
 * single-purpose endpoint rather than folding this into the generic
 * update. `publishAt: null` explicitly clears a schedule (unschedules
 * the event's listing); omitting the field entirely is not a valid
 * request for this endpoint, since scheduling is its whole purpose.
 * Not to be confused with `startAt`/`endAt` (when the event itself
 * happens) — see the entity's doc comment.
 */
export class ScheduleCalendarEventDto {
  @IsOptional()
  @IsDateString()
  publishAt!: string | null;
}
