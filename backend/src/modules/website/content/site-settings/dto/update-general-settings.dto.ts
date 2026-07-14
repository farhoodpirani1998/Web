import { Type } from 'class-transformer';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';

export class UpdateGeneralSettingsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  siteName?: TranslatableTextDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  tagline?: TranslatableTextDto;

  // Explicit null clears the logo; undefined leaves it unchanged —
  // same convention as AboutPage.imageMediaId.
  @IsOptional()
  @IsUUID()
  logoMediaId?: string | null;

  @IsOptional()
  @IsUUID()
  faviconMediaId?: string | null;
}
