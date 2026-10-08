import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';

export class UpdatePortalLinkDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  label?: TranslatableTextDto;

  @IsOptional()
  @IsString()
  @MinLength(1)
  url?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsBoolean()
  visible?: boolean;
}
