import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';
import { SeoMetadataDto } from '../../common/dto/seo-metadata.dto';

// Lowercase kebab-case only — e.g. "jane-smith". Kept local to Teachers,
// same as Campus/News/Events/Pages: the pattern is duplicated per
// slug-owning module rather than factored into a shared validator (see
// News' own comment).
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateTeacherDto {
  @IsString()
  @MaxLength(200)
  fullName!: string;

  @IsString()
  @MaxLength(200)
  @Matches(SLUG_PATTERN, {
    message: 'slug must be lowercase kebab-case (e.g. "jane-smith")',
  })
  slug!: string;

  @ValidateNested()
  @Type(() => TranslatableTextDto)
  jobTitle!: TranslatableTextDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  excerpt?: TranslatableTextDto;

  @ValidateNested()
  @Type(() => TranslatableTextDto)
  bio!: TranslatableTextDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  department?: TranslatableTextDto;

  @IsOptional()
  @IsUUID()
  campusId?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUUID()
  avatarMediaId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoMetadataDto)
  seo?: SeoMetadataDto;

  // `position` is deliberately not settable here — same convention as
  // CreateCampusDto: a new teacher is appended to the end of the
  // current order (see TeachersService.create), reordering is its own
  // dedicated endpoint/DTO (ReorderTeachersDto).
}
