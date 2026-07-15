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

// Lowercase kebab-case only — e.g. "downtown-campus". Kept local to
// Campuses, same as News/Events/Pages: the pattern is duplicated per
// slug-owning module rather than factored into a shared validator (see
// News' own comment).
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateCampusDto {
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  title!: TranslatableTextDto;

  @IsString()
  @MaxLength(200)
  @Matches(SLUG_PATTERN, {
    message: 'slug must be lowercase kebab-case (e.g. "downtown-campus")',
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
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  address?: TranslatableTextDto;

  @IsOptional()
  @IsUrl()
  mapUrl?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUUID()
  featuredImageMediaId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoMetadataDto)
  seo?: SeoMetadataDto;

  // `position` is deliberately not settable here — same convention as
  // CreateFeatureDto: a new campus is appended to the end of the
  // current order (see CampusesService.create), reordering is its own
  // dedicated endpoint/DTO (ReorderCampusesDto).
}
