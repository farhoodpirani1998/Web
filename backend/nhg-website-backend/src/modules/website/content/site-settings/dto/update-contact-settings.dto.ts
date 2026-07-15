import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';

export class UpdateContactSettingsDto {
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  address?: TranslatableTextDto;

  @IsOptional()
  @IsUrl()
  mapUrl?: string;
}
