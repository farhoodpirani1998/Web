import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MinLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { TranslatableTextDto } from '../../common/dto/translatable-text.dto';

export class UpdateTestimonialDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  authorName?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  authorRole?: TranslatableTextDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableTextDto)
  content?: TranslatableTextDto;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  // Explicit null clears the avatar; undefined leaves it unchanged.
  @IsOptional()
  @IsUUID()
  avatarMediaId?: string | null;
}
