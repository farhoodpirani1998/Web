import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsNumber,
  IsString,
  IsUrl,
  IsArray,
  ArrayMaxSize,
  ArrayUnique,
  MaxLength,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';
import { WorkingHoursEntryDto } from './working-hours-entry.dto';

export class UpdateContactSettingsDto {
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  contactPhones?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  address?: TranslatableTextDto;

  @IsOptional()
  @IsUrl()
  mapUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  mapLatitude?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  mapLongitude?: number | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(7)
  @ArrayUnique((entry: WorkingHoursEntryDto) => entry.day)
  @ValidateNested({ each: true })
  @Type(() => WorkingHoursEntryDto)
  workingHours?: WorkingHoursEntryDto[] | null;
}
