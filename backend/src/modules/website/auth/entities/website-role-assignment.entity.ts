import { Entity, Column, Unique } from 'typeorm';
import { BaseEntity } from '../../core/common/base.entity';
import { WebsiteRole } from '../website-role.enum';

/**
 * Maps an SMS-issued identity (externalUserId = the `sub` claim from
 * SMS's JWT) to a role in THIS backend's own authorization model.
 * This table lives only in the website database — it is not a mirror
 * of SMS's RBAC tables and is managed entirely by Website Super Admins.
 */
@Entity('website_role_assignments')
@Unique(['externalUserId'])
export class WebsiteRoleAssignment extends BaseEntity {
  @Column()
  externalUserId!: string; // the `sub` claim from the SMS-issued JWT

  @Column({ type: 'enum', enum: WebsiteRole })
  role!: WebsiteRole;
}
