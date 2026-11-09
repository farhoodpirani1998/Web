import { Type } from 'class-transformer';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';
import { FeatureIcon } from '../feature-icon.enum';

export class CreateFeatureDto {
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  title!: TranslatableTextDto;

  @ValidateNested()
  @Type(() => TranslatableTextDto)
  description!: TranslatableTextDto;

  @IsOptional()
  @IsEnum(FeatureIcon)
  icon?: string;
}
