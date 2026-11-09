import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsUrl,
  Matches,
  ValidateNested,
} from 'class-validator';
import { SocialPlatform } from '../entities/social-link.type';

export class SocialLinkDto {
  @IsEnum(SocialPlatform)
  platform!: SocialPlatform;

  @IsUrl({ protocols: ['https'], require_protocol: true })
  @Matches(/^https:\/\//i)
  url!: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

/**
 * Replaces the whole `socialLinks` array wholesale, rather than
 * add/remove-one-at-a-time endpoints — the list is small and fixed-
 * platform, so a full replace from the admin UI's "edit social links"
 * form is simpler than partial-patch semantics here.
 */
export class UpdateSocialLinksDto {
  @IsArray()
  @ArrayUnique((link: SocialLinkDto) => link.platform)
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  socialLinks!: SocialLinkDto[];
}
