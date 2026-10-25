import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { WebsiteRole } from '../../../auth/website-role.enum';

/**
 * Partial update for an existing admin — role change and/or active toggle.
 * Email is deliberately NOT editable (it's the login identifier; changing
 * it is a delete-and-recreate concern), and password changes go through
 * the dedicated change-password endpoint, not here.
 */
export class UpdateAdminUserDto {
  @IsOptional()
  @IsEnum(WebsiteRole)
  role?: WebsiteRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
