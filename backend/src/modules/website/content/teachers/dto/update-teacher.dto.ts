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

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class UpdateTeacherDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Matches(SLUG_PATTERN, {
    message: 'slug must be lowercase kebab-case (e.g. "jane-smith")',
  })
  slug?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  jobTitle?: TranslatableTextDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  excerpt?: TranslatableTextDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  bio?: TranslatableTextDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  department?: TranslatableTextDto;

  // Explicit null clears the campus link; undefined leaves it unchanged.
  @IsOptional()
  @IsUUID()
  campusId?: string | null;

  // Explicit null clears the phone number; undefined leaves it unchanged.
  @IsOptional()
  @IsString()
  phone?: string | null;

  // Explicit null clears the email; undefined leaves it unchanged.
  @IsOptional()
  @IsEmail()
  email?: string | null;

  // Explicit null clears the avatar; undefined leaves it unchanged.
  @IsOptional()
  @IsUUID()
  avatarMediaId?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoMetadataDto)
  seo?: SeoMetadataDto;

  // `position` is not editable through this endpoint — see
  // ReorderTeachersDto/TeachersController.reorder.
}
