import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';

export class CreatePortalLinkDto {
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  label!: TranslatableTextDto;

  @IsString()
  @MinLength(1)
  url!: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsBoolean()
  visible?: boolean;
}
