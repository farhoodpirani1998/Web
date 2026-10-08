import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';

export class UpdateStatisticDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  label?: TranslatableTextDto;

  @IsOptional()
  @IsNumber()
  value?: number;

  // Explicit null clears the suffix; undefined leaves it unchanged.
  @IsOptional()
  @IsString()
  @MaxLength(20)
  suffix?: string | null;

  // Explicit null clears the icon; undefined leaves it unchanged.
  @IsOptional()
  @IsString()
  icon?: string | null;

  // `position` is not editable through this endpoint — see
  // ReorderStatisticsDto/StatisticsController.reorder.
}
