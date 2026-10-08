import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';

export class UpdateGalleryItemDto {
  // Unlike Testimonial's avatarMediaId, this is never nullable — a
  // gallery item without an image isn't a meaningful row, so swapping
  // the photo is supported but clearing it isn't. Delete the item instead.
  @IsOptional()
  @IsUUID()
  imageMediaId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  caption?: TranslatableTextDto;

  @IsOptional()
  @IsString()
  category?: string;
}
