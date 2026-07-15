import { IsEnum } from 'class-validator';
import { WebsiteRole } from '../website-role.enum';

export class AssignWebsiteRoleDto {
  @IsEnum(WebsiteRole)
  role!: WebsiteRole;
}
