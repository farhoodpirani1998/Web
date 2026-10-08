import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';
import { SeoMetadataDto } from '../../common/dto/seo-metadata.dto';

// Lowercase kebab-case only — e.g. "new-stem-lab-opening". Kept local to
// News since it's the first (and so far only) module with a slug field.
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateNewsArticleDto {
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  title!: TranslatableTextDto;

  @IsString()
  @MaxLength(200)
  @Matches(SLUG_PATTERN, {
    message: 'slug must be lowercase kebab-case (e.g. "new-stem-lab-opening")',
  })
  slug!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  excerpt?: TranslatableTextDto;

  @ValidateNested()
  @Type(() => TranslatableTextDto)
  body!: TranslatableTextDto;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsUUID()
  featuredImageMediaId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoMetadataDto)
  seo?: SeoMetadataDto;
}
