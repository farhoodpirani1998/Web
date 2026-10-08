import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';

export class CreateFeatureDto {
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  title!: TranslatableTextDto;

  @ValidateNested()
  @Type(() => TranslatableTextDto)
  description!: TranslatableTextDto;

  @IsOptional()
  @IsString()
  icon?: string;
}
