import { Entity, Column, Unique, Index } from 'typeorm';
import { BaseEntity } from '../../../core/common/base.entity';
import { WebsiteRole } from '../../../auth/website-role.enum';

/**
 * A locally-authenticated CMS administrator.
 *
 * This is deliberately independent from `WebsiteRoleAssignment`
 * (`modules/website/auth/entities/website-role-assignment.entity.ts`),
 * which maps an *externally-issued* SMS identity (`externalUserId`, the
 * `sub` claim from an SMS JWT) to a role. That table/guard stack is
 * SMS's integration point and is intentionally left untouched by this
 * sprint (see Sprint 2.2 scope — "Do NOT modify SMS-related
 * authentication code").
 *
 * CmsAdminUser instead owns its own credential (email + password hash)
 * and is the row a future local login endpoint will authenticate
 * against. There is no `externalUserId` here and never should be —
 * mixing the two identity sources on one entity would blur exactly the
 * boundary the architecture decision draws between "CMS Admin" and
 * "SMS" users.
 *
 * `role` reuses the existing `WebsiteRole` enum (see
 * `auth/website-role.enum.ts`) rather than duplicating a parallel role
 * list — the same five roles and `ROLE_PERMISSIONS` map that already
 * govern authorization apply here unchanged; only *how a role gets
 * attached to an identity* differs (a column on this table instead of
 * a lookup keyed by an external id). The Postgres enum type itself is
 * still per-table (`admin_users_role_enum`, distinct from
 * `website_role_assignments_role_enum`), matching this codebase's
 * existing convention of a dedicated enum type per table even when the
 * value set is shared conceptually (see e.g. `about_page_status_enum`
 * vs `faqs_status_enum`, both draft/published/archived).
 *
 * `passwordHash` is a placeholder column only in the sense that no
 * hashing library or login endpoint exists yet as of this sprint — the
 * column itself is real and required (never nullable): every admin
 * user row must have a credential from the moment it's created. It
 * stores a hash only; this entity and this sprint do not touch how
 * that hash gets produced or verified (Sprint 2.3+).
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

  @Column({ type: 'enum', enum: WebsiteRole, enumName: 'admin_users_role_enum' })
  role!: WebsiteRole;

  /**
   * Soft on/off switch for an admin account (disable without deleting,
   * e.g. offboarding). Defaults active so existing rows created via the
   * bootstrap flow (Sprint 2.2 documentation, not yet implemented) are
   * usable immediately.
   */
  @Column({ default: true })
  isActive!: boolean;
}
