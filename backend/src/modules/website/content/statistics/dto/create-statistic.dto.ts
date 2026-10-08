import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';

export class CreateStatisticDto {
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  label!: TranslatableTextDto;

  @IsNumber()
  value!: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  suffix?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  // `position` is deliberately not settable here — same convention as
  // CreateFeatureDto: a new statistic is appended to the end of the
  // current order (see StatisticsService.create), reordering is its
  // own dedicated endpoint/DTO (ReorderStatisticsDto).
}
