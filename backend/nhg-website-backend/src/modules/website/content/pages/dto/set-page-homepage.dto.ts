import { IsBoolean } from 'class-validator';

/**
 * Dedicated action DTO, same idiom as UpdatePageStatusDto/SchedulePageDto.
 * Designating (or clearing) the site's single homepage page is a
 * distinct workflow decision with a side effect — it unsets whichever
 * other page previously held the flag — not a plain field edit via the
 * generic update endpoint.
 */
export class SetPageHomepageDto {
  @IsBoolean()
  isHomepage!: boolean;
}
