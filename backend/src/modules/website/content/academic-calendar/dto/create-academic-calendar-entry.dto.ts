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

export class CreateAcademicCalendarEntryDto {
  @IsEnum(AcademicCalendarEntryKind)
  kind!: AcademicCalendarEntryKind;

  @ValidateNested()
  @Type(() => TranslatableTextDto)
  title!: TranslatableTextDto;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  value?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  dateRange?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  date?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  description?: TranslatableTextDto;
}
