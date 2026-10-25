import {
  IsEmail,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { WebsiteRole } from '../../../auth/website-role.enum';

export class CreateAdminUserDto {
  // Normalized (trimmed + lowercased) the same way `LoginDto` normalizes
  // login input, so a row created here can be logged into case-insensitively.
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(256)
  email!: string;

  // Minimum length only — a strength policy (character classes etc.) is a
  // product decision; the bootstrap script draws the same 12-char line, so
  // this matches it. Max 256 mirrors LoginDto.
  @IsString()
  @MinLength(12, { message: 'password must be at least 12 characters' })
  @MaxLength(256)
  password!: string;

  @IsEnum(WebsiteRole)
  role!: WebsiteRole;
}
