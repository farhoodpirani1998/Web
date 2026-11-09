import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { TextbookSourceType } from '../entities/textbook.entity';

export class CreateTextbookDto {
  @IsObject()
  title!: { fa: string; en?: string };

  @IsString()
  @MaxLength(180)
  slug!: string;

  @IsString()
  @MaxLength(80)
  code!: string;

  @IsString()
  @MaxLength(100)
  stage!: string;

  @IsString()
  @MaxLength(80)
  grade!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  field?: string | null;

  @IsString()
  @MaxLength(120)
  subject!: string;

  @IsString()
  @MaxLength(24)
  academicYear!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  edition?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5000)
  pageCount?: number | null;

  @IsEnum(TextbookSourceType)
  sourceType!: TextbookSourceType;

  @ValidateIf(
    (dto: CreateTextbookDto) =>
      dto.sourceType === TextbookSourceType.EXTERNAL_LINK,
  )
  @IsUrl({ require_protocol: true, protocols: ['https'] })
  externalUrl?: string | null;

  @IsString()
  @MaxLength(300)
  sourceAttribution!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  licenseNote?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
