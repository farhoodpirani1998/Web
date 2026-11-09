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

class AboutStatDto {
  @IsUUID()
  id!: string;

  @IsString()
  @MaxLength(20)
  @Matches(/^[0-9]+(?:\.[0-9]{1,2})?$/)
  value!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  suffix?: string;

  @ValidateNested()
  @Type(() => TranslatableTextDto)
  label!: TranslatableTextDto;
}

class AboutValueDto {
  @IsUUID()
  id!: string;

  @ValidateNested()
  @Type(() => TranslatableTextDto)
  title!: TranslatableTextDto;

  @ValidateNested()
  @Type(() => TranslatableTextDto)
  description!: TranslatableTextDto;
}

class AboutTimelineItemDto {
  @IsUUID()
  id!: string;

  @IsString()
  @MaxLength(4)
  @Matches(/^[0-9]+$/)
  year!: string;

  @ValidateNested()
  @Type(() => TranslatableTextDto)
  title!: TranslatableTextDto;

  @ValidateNested()
  @Type(() => TranslatableTextDto)
  description!: TranslatableTextDto;
}

class AboutTeamMemberDto {
  @IsUUID()
  id!: string;

  @ValidateNested()
  @Type(() => TranslatableTextDto)
  name!: TranslatableTextDto;

  @ValidateNested()
  @Type(() => TranslatableTextDto)
  role!: TranslatableTextDto;

  @IsOptional()
  @IsUUID()
  avatarMediaId?: string | null;
}

class AboutSectionMetadataDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  title?: TranslatableTextDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  description?: TranslatableTextDto;
}

class AboutStatsSectionDto extends AboutSectionMetadataDto {
  @IsOptional()
  @IsArray()
  @ArrayUnique((item: AboutStatDto) => item.id)
  @ValidateNested({ each: true })
  @Type(() => AboutStatDto)
  items?: AboutStatDto[];
}

class AboutValuesSectionDto extends AboutSectionMetadataDto {
  @IsOptional()
  @IsArray()
  @ArrayUnique((item: AboutValueDto) => item.id)
  @ValidateNested({ each: true })
  @Type(() => AboutValueDto)
  items?: AboutValueDto[];
}

class AboutTimelineSectionDto extends AboutSectionMetadataDto {
  @IsOptional()
  @IsArray()
  @ArrayUnique((item: AboutTimelineItemDto) => item.id)
  @ValidateNested({ each: true })
  @Type(() => AboutTimelineItemDto)
  items?: AboutTimelineItemDto[];
}

class AboutTeamSectionDto extends AboutSectionMetadataDto {
  @IsOptional()
  @IsArray()
  @ArrayUnique((item: AboutTeamMemberDto) => item.id)
  @ValidateNested({ each: true })
  @Type(() => AboutTeamMemberDto)
  items?: AboutTeamMemberDto[];
}

export class AboutSectionsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => AboutStatsSectionDto)
  stats?: AboutStatsSectionDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AboutValuesSectionDto)
  values?: AboutValuesSectionDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AboutTimelineSectionDto)
  timeline?: AboutTimelineSectionDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AboutTeamSectionDto)
  team?: AboutTeamSectionDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AboutSectionMetadataDto)
  faq?: AboutSectionMetadataDto;
}

export class UpdateAboutDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  title?: TranslatableTextDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  body?: TranslatableTextDto;

  // Explicit null clears the image; undefined leaves it unchanged.
  @IsOptional()
  @IsUUID()
  imageMediaId?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => AboutSectionsDto)
  // Replaces the complete section configuration; nested item arrays are ordered lists.
  sections?: AboutSectionsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoMetadataDto)
  seo?: SeoMetadataDto;
}
