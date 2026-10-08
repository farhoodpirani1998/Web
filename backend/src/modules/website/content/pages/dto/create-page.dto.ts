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

// Lowercase kebab-case only — e.g. "admissions-policy". Kept local to
// Pages, same as News: the pattern is duplicated per slug-owning module
// rather than factored into a shared validator (see News' own comment).
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreatePageDto {
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  title!: TranslatableTextDto;

  @IsString()
  @MaxLength(200)
  @Matches(SLUG_PATTERN, {
    message: 'slug must be lowercase kebab-case (e.g. "admissions-policy")',
  })
  slug!: string;

  @ValidateNested()
  @Type(() => TranslatableTextDto)
  body!: TranslatableTextDto;

  @IsOptional()
  @IsEnum(PageTemplate)
  template?: PageTemplate;

  // Note: `isHomepage` is deliberately not settable here — see
  // PagesController's dedicated `/homepage` endpoint.
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsBoolean()
  showInMenu?: boolean;

  @IsOptional()
  @IsUUID()
  featuredImageMediaId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoMetadataDto)
  seo?: SeoMetadataDto;
}
