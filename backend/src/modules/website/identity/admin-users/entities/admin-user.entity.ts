import { Entity, Column, Unique, Index } from 'typeorm';
import { BaseEntity } from '../../../core/common/base.entity';
import { WebsiteRole } from '../../../auth/website-role.enum';

/**
 * A locally-authenticated CMS administrator.
 *
 * CmsAdminUser owns its own credential (email + password hash) and is
 * the row the local CMS login endpoint authenticates against.
 *
 * `role` reuses the existing `WebsiteRole` enum (see
 * `auth/website-role.enum.ts`) rather than duplicating a parallel role
 * list — the same five roles and `ROLE_PERMISSIONS` map that already
 * govern authorization apply here unchanged; only *how a role gets
 * attached to an identity. The Postgres enum type itself is per-table,
 * matching this codebase's existing convention of a dedicated enum
 * type per table even when the value set is shared conceptually (see
 * e.g. `about_page_status_enum`
 * vs `faqs_status_enum`, both draft/published/archived).
 *
 * `passwordHash` stores a hash only; every admin user row requires a
 * credential from the moment it is created.
 */
@Entity('admin_users')
@Unique('UQ_admin_users_email', ['email'])
export class CmsAdminUser extends BaseEntity {
  @Index('IDX_admin_users_email')
  @Column()
  email!: string;

  /** Hashed credential only — never store or accept a plaintext password here. */
  @Column()
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: WebsiteRole,
    enumName: 'admin_users_role_enum',
  })
  role!: WebsiteRole;

  /**
   * Soft on/off switch for an admin account (disable without deleting,
   * e.g. offboarding). Defaults active so newly created admin accounts
   * are usable immediately.
   */
  @Column({ default: true })
  isActive!: boolean;
}
