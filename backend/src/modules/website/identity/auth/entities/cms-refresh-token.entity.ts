import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../core/common/base.entity';

/**
 * A single refresh token issued to a `CmsAdminUser`, backing the
 * "Persistent Login" feature (Sprint — Persistent Login). Complements
 * the short-lived (`CMS_JWT_EXPIRES_IN`, ~15m) stateless access token
 * `CmsAuthService` already issues: that token still authenticates every
 * request exactly as before (see `CmsAuthGuard`, unchanged), while a row
 * here lets an admin silently obtain a new one — via `POST
 * /admin/auth/refresh` — without re-entering credentials, for as long as
 * this row remains valid.
 *
 * Deliberately its own table rather than a JWT: unlike the access token,
 * a refresh token must be revocable on demand (logout, rotation reuse,
 * an admin being deactivated) and a stateless token can't be revoked
 * without a blocklist — which is just this table by another name. A
 * random opaque string plus a DB row is simpler and is the same
 * trade-off this codebase already made for password storage (verify
 * against a stored hash, not a self-contained token).
 *
 * `tokenHash`, never the raw token: mirrors `CmsAdminUser.passwordHash`
 * — if this table were ever read (a backup, a DB dump, a bug in another
 * query), the values here must not themselves be usable to authenticate.
 * Hashed with plain SHA-256 (`refresh-token-hash.util.ts`), not
 * `PasswordHasherService`'s argon2id: the token is already 256 bits of
 * `crypto.randomBytes`, so unlike a human-chosen password there is no
 * low-entropy input for a slow, memory-hard hash to defend against — a
 * fast, deterministic digest is exactly what a lookup-by-hash needs.
 *
 * Rotation chain (`replacedByTokenHash`): every successful `/refresh`
 * revokes the presented token and issues a new one, recording the new
 * token's hash on the old row rather than just deleting it. This is
 * what makes reuse detection possible (`CmsRefreshTokenService.rotate`):
 * a request presenting a token whose row is already revoked is either
 * the losing side of a benign race against its own legitimate successor
 * (within a short grace window) or a replayed, already-superseded token
 * being reused well after the fact — see `rotate`'s doc comment for how
 * those are told apart and what happens in each case.
 *
 * No `siteId` (unlike `AuditLogEntry`): CMS Admin identity is global
 * across the platform, not per-site — same reasoning as `CmsAdminUser`
 * itself carrying no `siteId` column.
 */
@Entity('cms_refresh_tokens')
export class CmsRefreshToken extends BaseEntity {
  @Index('IDX_cms_refresh_tokens_adminId')
  @Column('uuid')
  adminId!: string;

  /** SHA-256 hex digest of the raw token. Unique: two rows can never hash-collide in practice. */
  @Index('IDX_cms_refresh_tokens_tokenHash', { unique: true })
  @Column()
  tokenHash!: string;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  /**
   * Set the moment this token is superseded (by rotation) or explicitly
   * revoked (logout, reuse-detection sweep). Unset (`undefined` in TS,
   * `NULL` in the database — same convention as `AuditLogEntry`'s
   * optional columns) means "still valid, subject to `expiresAt`" — the
   * only state `CmsRefreshTokenService` will accept for a fresh
   * `/refresh` call.
   */
  @Column({ type: 'timestamptz', nullable: true })
  revokedAt?: Date;

  /**
   * Hash of the token that replaced this one via rotation, if any.
   * Populated only when this row was revoked *because* it was
   * successfully rotated — left unset for an explicit logout/reuse
   * revocation, where there is no successor. Not currently read back by
   * any code path; kept purely as an audit trail for investigating a
   * reuse-detection event after the fact.
   */
  @Column({ nullable: true })
  replacedByTokenHash?: string;
}
