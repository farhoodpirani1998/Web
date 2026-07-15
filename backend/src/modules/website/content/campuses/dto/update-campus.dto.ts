import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';
import { SeoMetadataDto } from '../../common/dto/seo-metadata.dto';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class UpdateCampusDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  title?: TranslatableTextDto;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Matches(SLUG_PATTERN, {
    message: 'slug must be lowercase kebab-case (e.g. "downtown-campus")',
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
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  address?: TranslatableTextDto;

  // Explicit null clears the map link; undefined leaves it unchanged.
  @IsOptional()
  @IsUrl()
  mapUrl?: string | null;

  // Explicit null clears the phone number; undefined leaves it unchanged.
  @IsOptional()
  @IsString()
  phone?: string | null;

  // Explicit null clears the email; undefined leaves it unchanged.
  @IsOptional()
  @IsEmail()
  email?: string | null;

  // Explicit null clears the featured image; undefined leaves it unchanged.
  @IsOptional()
  @IsUUID()
  featuredImageMediaId?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoMetadataDto)
  seo?: SeoMetadataDto;

  // `position` is not editable through this endpoint — see
  // ReorderCampusesDto/CampusesController.reorder.
}
