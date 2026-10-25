import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';

export class UpdateAchievementDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  value?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  label?: TranslatableTextDto;

  // Explicit null clears the icon; undefined leaves it unchanged.
  @IsOptional()
  @IsString()
  icon?: string | null;
}
