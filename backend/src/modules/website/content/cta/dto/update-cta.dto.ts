import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';

export class UpdateCtaDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  title?: TranslatableTextDto;

  // Explicit null clears the description; undefined leaves it unchanged.
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  description?: TranslatableTextDto | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  primaryButtonLabel?: TranslatableTextDto;

  @IsOptional()
  @IsString()
  primaryButtonUrl?: string;

  // Explicit null clears the secondary button; undefined leaves it unchanged.
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  secondaryButtonLabel?: TranslatableTextDto | null;

  // Explicit null clears the secondary button url; undefined leaves it unchanged.
  @IsOptional()
  @IsString()
  secondaryButtonUrl?: string | null;

  // Explicit null clears the image; undefined leaves it unchanged.
  @IsOptional()
  @IsUUID()
  backgroundImageMediaId?: string | null;
}
