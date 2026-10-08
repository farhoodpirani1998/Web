import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';
import { SeoMetadataDto } from '../../common/dto/seo-metadata.dto';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class UpdateCalendarEventDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  title?: TranslatableTextDto;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Matches(SLUG_PATTERN, {
    message: 'slug must be lowercase kebab-case (e.g. "spring-open-house")',
  })
  slug?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  excerpt?: TranslatableTextDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  body?: TranslatableTextDto;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  location?: TranslatableTextDto;

  // Explicit null clears the location URL; undefined leaves it unchanged.
  @IsOptional()
  @IsString()
  locationUrl?: string | null;

  @IsOptional()
  @IsDateString()
  startAt?: string;

  // Explicit null clears the end time; undefined leaves it unchanged.
  @IsOptional()
  @IsDateString()
  endAt?: string | null;

  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  // Explicit null clears the featured image; undefined leaves it unchanged.
  @IsOptional()
  @IsUUID()
  featuredImageMediaId?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoMetadataDto)
  seo?: SeoMetadataDto;
}
