import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';

export class CreateAchievementDto {
  @IsString()
  @MaxLength(50)
  value!: string;

  @ValidateNested()
  @Type(() => TranslatableTextDto)
  label!: TranslatableTextDto;

  @IsOptional()
  @IsString()
  icon?: string;

  // `position` is deliberately not settable here — a new achievement is
  // appended to the end of the current order; reordering is its own
  // dedicated endpoint/DTO (ReorderAchievementsDto).
}
