import { Type } from 'class-transformer';
import { IsOptional, IsUrl, IsUUID, ValidateNested } from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';

export class CreateTrustBadgeDto {
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  name!: TranslatableTextDto;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  url?: string;

  @IsUUID()
  imageMediaId!: string;
}
