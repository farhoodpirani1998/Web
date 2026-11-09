import { IsBoolean, IsEnum, IsMilitaryTime } from 'class-validator';
import { WorkingHoursDay } from '../entities/working-hours.type';

export class WorkingHoursEntryDto {
  @IsEnum(WorkingHoursDay)
  day!: WorkingHoursDay;

  @IsMilitaryTime()
  openTime!: string;

  @IsMilitaryTime()
  closeTime!: string;

  @IsBoolean()
  isClosed!: boolean;
}
