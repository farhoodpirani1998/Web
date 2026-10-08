import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';

export class CreateGalleryItemDto {
  @IsUUID()
  imageMediaId!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  caption?: TranslatableTextDto;

  @IsOptional()
  @IsString()
  category?: string;
}
