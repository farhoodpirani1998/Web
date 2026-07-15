import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';

export class UpdateFaqDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  question?: TranslatableTextDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  answer?: TranslatableTextDto;

  @IsOptional()
  @IsString()
  category?: string;
}
