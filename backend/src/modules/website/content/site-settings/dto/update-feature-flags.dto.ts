import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateFeatureFlagsDto {
  @IsOptional()
  @IsBoolean()
  newsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  galleryEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  testimonialsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  faqEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  eventsEnabled?: boolean;
}
