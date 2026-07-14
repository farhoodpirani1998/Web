import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';

export class CreateHeroSlideDto {
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  heading!: TranslatableTextDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  subheading?: TranslatableTextDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  ctaLabel?: TranslatableTextDto;

  // Plain string, not @IsUrl — CTAs commonly link to internal relative
  // paths (e.g. "/admissions"), which @IsUrl would reject.
  @IsOptional()
  @IsString()
  ctaUrl?: string;

  @IsOptional()
  @IsUUID()
  backgroundMediaId?: string;
}
