import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

/**
 * Wire shape for the shared `SeoMetadata` embeddable (core/seo). Shared
 * here rather than duplicated per module — About is the first
 * page-like content module to adopt it, more will reuse this DTO.
 */
export class SeoMetadataDto {
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsUrl()
  ogImageUrl?: string;

  @IsOptional()
  @IsUrl()
  canonicalUrl?: string;

  @IsOptional()
  @IsBoolean()
  noindex?: boolean;
}
