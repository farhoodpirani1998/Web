import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';

export class UpdateHeroSlideDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  heading?: TranslatableTextDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  subheading?: TranslatableTextDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  ctaLabel?: TranslatableTextDto;

  @IsOptional()
  @IsString()
  ctaUrl?: string;

  // Explicit null clears the background image; undefined leaves it as-is.
  @IsOptional()
  @IsUUID()
  backgroundMediaId?: string | null;
}
