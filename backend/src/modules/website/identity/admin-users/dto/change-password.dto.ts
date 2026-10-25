import { IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Self-service password change (`POST /admin/auth/change-password`).
 * Requires the current password so a stolen access token alone can't
 * lock the real owner out or take over the account. The new password is
 * not trimmed — whitespace is part of the secret (same reasoning as
 * `LoginDto.password`).
 */
export class ChangePasswordDto {
  @IsString()
  @MaxLength(256)
  currentPassword!: string;

  @IsString()
  @MinLength(12, { message: 'new password must be at least 12 characters' })
  @MaxLength(256)
  newPassword!: string;
}
