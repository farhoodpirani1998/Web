import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';
import { SeoMetadataDto } from '../../common/dto/seo-metadata.dto';
import { PageTemplate } from '../entities/page-template.enum';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class UpdatePageDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  title?: TranslatableTextDto;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Matches(SLUG_PATTERN, {
    message: 'slug must be lowercase kebab-case (e.g. "admissions-policy")',
  })
  slug?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  body?: TranslatableTextDto;

  @IsOptional()
  @IsEnum(PageTemplate)
  template?: PageTemplate;

  // Explicit null moves the page back to top-level; undefined leaves it
  // unchanged. A non-null value is re-validated (exists, same site, no
  // cycle) in PagesService — see assertValidParent.
  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @IsOptional()
  @IsBoolean()
  showInMenu?: boolean;

  // Explicit null clears the featured image; undefined leaves it unchanged.
  @IsOptional()
  @IsUUID()
  featuredImageMediaId?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoMetadataDto)
  seo?: SeoMetadataDto;
}
