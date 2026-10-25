import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';
import { AcademicCalendarEntryKind } from '../entities/academic-calendar-entry.entity';

export class UpdateAcademicCalendarEntryDto {
  @IsOptional()
  @IsEnum(AcademicCalendarEntryKind)
  kind?: AcademicCalendarEntryKind;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  title?: TranslatableTextDto;

  // Explicit null clears the field; undefined leaves it unchanged.
  @IsOptional()
  @IsString()
  @MaxLength(100)
  value?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  dateRange?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  date?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  description?: TranslatableTextDto | null;
}
