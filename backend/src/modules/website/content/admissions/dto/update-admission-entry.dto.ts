import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';
import { AdmissionEntryKind } from '../entities/admission-entry.entity';

export class UpdateAdmissionEntryDto {
  @IsOptional()
  @IsEnum(AdmissionEntryKind)
  kind?: AdmissionEntryKind;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  title?: TranslatableTextDto;

  // Explicit null clears the field; undefined leaves it unchanged.
  @IsOptional()
  @IsString()
  @MaxLength(50)
  value?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  description?: TranslatableTextDto | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  price?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  period?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  includes?: string[] | null;
}
