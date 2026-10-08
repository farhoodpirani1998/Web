import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CmsRefreshToken } from './entities/cms-refresh-token.entity';
import { generateRefreshToken, hashRefreshToken } from './refresh-token-hash.util';

export interface IssuedRefreshToken {
  /** Raw token — hand this to the client (cookie) and never persist it as-is. */
  rawToken: string;
  expiresAt: Date;
}

/**
 * How soon after a token is revoked a second presentation of it is
 * still treated as a benign race rather than suspected theft — see
 * `rotate`'s doc comment. Deliberately a module-level constant, not a
 * `ConfigService` read: unlike the JWT/cookie settings, there's no
 * deployment-specific reason this should ever need to be tuned per
 * environment, and keeping it a constant means every call site (and
 * this file's tests) can reason about it without threading a
 * `ConfigService` through a service that otherwise has none.
 */
const REUSE_GRACE_MS = 10_000;

/**
 * Owns the lifecycle of `CmsRefreshToken` rows: issuing a new one at
 * login, rotating it on every `/refresh` call, and revoking it (or an
 * admin's entire chain) on logout or on detecting reuse. Split out from
 * `CmsAuthService` the same way `PasswordHasherService` is: a distinct
 * responsibility (persistence + a security-sensitive invariant) that
 * benefits from living in one small, independently testable unit rather
 * than growing inside the service that already owns login/access-token
 * issuance.
 */
@Injectable()
export class CmsRefreshTokenService {
  constructor(
    @InjectRepository(CmsRefreshToken)
    private readonly repo: Repository<CmsRefreshToken>,
  ) {}

  /** Issues a brand-new refresh token for `adminId`, unrelated to any existing chain (used at login). */
  async issue(adminId: string, ttlMs: number): Promise<IssuedRefreshToken> {
    const rawToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + ttlMs);

    await this.repo.insert({
      adminId,
      tokenHash: hashRefreshToken(rawToken),
      expiresAt,
    });

    return { rawToken, expiresAt };
  }

  /**
   * Validates a presented raw refresh token and, if valid, rotates it:
   * revokes the presented row (recording its successor) and issues a
   * fresh one for the same admin.
   *
   * Atomic by construction, not by locking: the revocation itself is a
   * single conditional `UPDATE ... WHERE "tokenHash" = ? AND
   * "revokedAt" IS NULL AND "expiresAt" > now()` — Postgres's own
   * row-level locking means at most one concurrent caller can ever
   * affect that row, even if two `/refresh` requests present the same
   * still-valid token at the same instant (two browser tabs reloading
   * together, or React StrictMode's dev-only double effect-invoke).
   * The loser sees `affected === 0`. Reading `adminId` back afterward
   * (`this.repo.findOne`) is safe without its own lock: once a row is
   * claimed, `adminId` never changes underneath it.
   *
   * Reuse detection, with a grace window: a token whose row exists but
   * is already revoked is either (a) the losing side of the exact race
   * described above — the winner revoked it a moment ago as part of a
   * legitimate rotation, or (b) an attacker replaying a token the
   * legitimate client rotated away from much earlier. Both look
   * identical from the token alone; `REUSE_GRACE_MS` since `revokedAt`
   * is what tells them apart. Within the grace window, this is treated
   * as the benign race: reject *this* request but leave the winner's
   * (and every other) token alone. Past the grace window, it's treated
   * as likely theft: revoke every other still-valid token for that
   * admin (`revokeAllForAdmin`) too. A legitimate admin only ever hits
   * the second path if their own client held onto a token this stale
   * without using it — at which point re-login is the safe outcome.
   *
   * Returns `null` (never throws) for "no such token" / "expired" /
   * "revoked" — the controller maps every rejection to the same generic
   * 401, so there's nothing a caller needs to branch on here.
   */
  async rotate(rawToken: string, ttlMs: number): Promise<{ adminId: string; issued: IssuedRefreshToken } | null> {
    const tokenHash = hashRefreshToken(rawToken);

    const claim = await this.repo
      .createQueryBuilder()
      .update(CmsRefreshToken)
      .set({ revokedAt: new Date() })
      .where('"tokenHash" = :tokenHash', { tokenHash })
      .andWhere('"revokedAt" IS NULL')
      .andWhere('"expiresAt" > :now', { now: new Date() })
      .execute();

    if (!claim.affected) {
      // Didn't win the claim (or there's no such row at all). Re-read
      // to tell "already revoked" (possible reuse — subject to the
      // grace window above) apart from "no such token" / "merely
      // expired" (neither of which implies anything malicious).
      const existing = await this.repo.findOne({ where: { tokenHash } });
      if (existing?.revokedAt) {
        const revokedMsAgo = Date.now() - existing.revokedAt.getTime();
        if (revokedMsAgo > REUSE_GRACE_MS) {
          await this.revokeAllForAdmin(existing.adminId);
        }
      }
      return null;
    }

    const claimed = await this.repo.findOne({ where: { tokenHash } });
    // Can't be null: this call just successfully revoked it, and rows
    // are never deleted (only revoked) elsewhere in this service.
    const adminId = claimed!.adminId;

    const issued = await this.issue(adminId, ttlMs);
    await this.repo.update({ tokenHash }, { replacedByTokenHash: hashRefreshToken(issued.rawToken) });

    return { adminId, issued };
  }

  /** Revokes exactly the presented token (logout from the current session only). No-op if it doesn't exist or is already revoked. */
  async revoke(rawToken: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(CmsRefreshToken)
      .set({ revokedAt: new Date() })
      .where('"tokenHash" = :tokenHash', { tokenHash: hashRefreshToken(rawToken) })
      .andWhere('"revokedAt" IS NULL')
      .execute();
  }

  /** Revokes every currently-valid token for an admin (reuse detection, or a future "log out everywhere"). */
  async revokeAllForAdmin(adminId: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(CmsRefreshToken)
      .set({ revokedAt: new Date() })
      .where('"adminId" = :adminId', { adminId })
      .andWhere('"revokedAt" IS NULL')
      .execute();
  }
}
