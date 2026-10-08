import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';

export class CreateFaqDto {
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  question!: TranslatableTextDto;

  @ValidateNested()
  @Type(() => TranslatableTextDto)
  answer!: TranslatableTextDto;

  @IsOptional()
  @IsString()
  category?: string;
}
