import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { TextbookTaxonomyType } from '../entities/textbook-taxonomy.entity';

export class TextbookTaxonomyDto {
  @IsEnum(TextbookTaxonomyType)
  type!: TextbookTaxonomyType;

  @IsString()
  @MaxLength(120)
  value!: string;

  @IsString()
  @MaxLength(160)
  label!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
