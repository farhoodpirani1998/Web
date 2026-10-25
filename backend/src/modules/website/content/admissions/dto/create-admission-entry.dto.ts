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

export class CreateAdmissionEntryDto {
  @IsEnum(AdmissionEntryKind)
  kind!: AdmissionEntryKind;

  @ValidateNested()
  @Type(() => TranslatableTextDto)
  title!: TranslatableTextDto;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  value?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  description?: TranslatableTextDto;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  price?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  period?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  includes?: string[];
}
