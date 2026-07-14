import { IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Wire shape for the `Translatable<string>` convention (core/i18n).
 * `fa` is mandatory since Locale.FA is DEFAULT_LOCALE; `en` is optional
 * until the content is actually translated. Shared here rather than
 * duplicated per content module — FAQ and Testimonials are the first
 * two modules to adopt the convention, more will reuse this DTO.
 */
export class TranslatableTextDto {
  @IsString()
  @MinLength(1)
  fa!: string;

  @IsOptional()
  @IsString()
  en?: string;
}
