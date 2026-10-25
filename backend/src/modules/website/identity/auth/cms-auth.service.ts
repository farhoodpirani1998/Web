import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CmsAdminUser } from '../admin-users/entities/admin-user.entity';
import { PasswordHasherService } from './password/password-hasher.service';
import { LoginDto } from './dto/login.dto';
import {
  ROLE_PERMISSIONS,
  WebsitePermission,
  WebsiteRole,
} from '../../auth/website-role.enum';
import { CmsRefreshTokenService } from './cms-refresh-token.service';

/** Never leak `passwordHash` (or any other internal column) past this service. */
export interface SafeAdminIdentity {
  id: string;
  email: string;
  role: WebsiteRole;
}

export interface SafeAdminIdentityWithPermissions extends SafeAdminIdentity {
  permissions: WebsitePermission[];
}

/**
 * `admin` carries the permission list on purpose: this is the same shape
 * `/auth/me` returns, and it's the only way the SPA learns what the
 * current admin may do after a page reload — `AuthProvider` bootstraps
 * from the refresh cookie through this response, not through `/auth/me`,
 * so a `LoginResult` without `permissions` silently leaves every client
 * side permission check failing.
 */
export interface LoginResult {
  accessToken: string;
  admin: SafeAdminIdentityWithPermissions;
}

/**
 * A hash that verifies false against any real password. Used only to
 * keep `login()`'s runtime roughly constant whether or not `email`
 * matched a row, so response timing can't be used to enumerate valid
 * admin emails. Generated once per process, not per request — argon2
 * hashing has a fixed, deliberately expensive cost regardless of the
 * input, which is what makes this comparison meaningful.
 */
const DUMMY_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHRzb21lc2FsdA$Y7L1E7l1v3q0kq6z8t2q9C0f8m2s1p9r7t0y3x5w7z0';

@Injectable()
export class CmsAuthService {
  private readonly jwtSecret: string;
  private readonly jwtIssuer: string;
  private readonly jwtExpiresIn: string;

  constructor(
    @InjectRepository(CmsAdminUser)
    private readonly adminRepo: Repository<CmsAdminUser>,
    private readonly passwordHasher: PasswordHasherService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly refreshTokens: CmsRefreshTokenService,
  ) {
    this.jwtSecret = this.config.getOrThrow<string>('CMS_JWT_SECRET');
    this.jwtIssuer = this.config.get<string>('CMS_JWT_ISSUER') ?? 'nhg-cms';
    // Short-lived on purpose — see CmsAuthGuard's doc comment: this is
    // the mitigation for the guard never re-checking `isActive` per
    // request. Sprint — Persistent Login adds a refresh token
    // (`CmsRefreshTokenService`) precisely so this can stay short: an
    // admin no longer has to re-enter credentials once it expires, only
    // silently exchange their refresh token for a new one of these.
    this.jwtExpiresIn = this.config.get<string>('CMS_JWT_EXPIRES_IN') ?? '15m';
  }

  /**
   * Order matters for what an attacker can learn from the response:
   * 1. Look up the row (always run a password hash comparison either
   *    way, real or dummy, so a nonexistent email doesn't return
   *    faster than a real one).
   * 2. Verify the password *before* checking `isActive` — so knowing
   *    an account is disabled requires already knowing its correct
   *    password, not just its email.
   * Both "no such email" and "wrong password" throw the same generic
   * message; only a correct password against a disabled account gets
   * the more specific one.
   */
  async login(dto: LoginDto): Promise<LoginResult> {
    const admin = await this.adminRepo.findOne({ where: { email: dto.email } });

    const passwordMatches = await this.passwordHasher.verify(
      admin?.passwordHash ?? DUMMY_HASH,
      dto.password,
    );

    if (!admin || !passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!admin.isActive) {
      throw new ForbiddenException('This admin account has been disabled');
    }

    const accessToken = await this.signAccessToken(admin);

    return {
      accessToken,
      admin: this.toIdentityWithPermissions(admin),
    };
  }

  /**
   * Self-service password change. Verifies `currentPassword` before
   * hashing/writing `newPassword`, so a stolen access token alone can't
   * take over the account. Rejects with a generic 401 when the current
   * password doesn't match — no distinction that would help an attacker
   * probe. Revokes every refresh token before saving the new password,
   * so a stale session cannot continue minting access tokens after a change.
   * The current access token remains valid until its short expiry.
   */
  async changePassword(
    adminId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const admin = await this.adminRepo.findOne({ where: { id: adminId } });
    if (!admin) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const matches = await this.passwordHasher.verify(
      admin.passwordHash,
      currentPassword,
    );
    if (!matches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await this.passwordHasher.hash(newPassword);
    await this.refreshTokens.revokeAllForAdmin(adminId);
    admin.passwordHash = passwordHash;
    await this.adminRepo.save(admin);
  }

  /**
   * Re-reads the row from the database rather than trusting the JWT
   * payload alone — this is the one place in the request lifecycle
   * that reflects a role change or deactivation that happened *after*
   * the token was issued (the guard itself is stateless, see
   * CmsAuthGuard). Throws the same `UnauthorizedException` for "no
   * longer exists" and "deactivated" as for any other invalid-session
   * case, rather than a `NotFoundException`/`ForbiddenException`
   * distinction — from the caller's perspective both simply mean "you
   * are no longer authenticated," and the specifics aren't
   * information a client should need to branch on.
   */
  async getCurrentAdmin(id: string): Promise<SafeAdminIdentityWithPermissions> {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Admin account is no longer active');
    }
    return this.toIdentityWithPermissions(admin);
  }

  /**
   * Mints a fresh access token for an admin identified only by id —
   * called from `CmsAuthController.refresh` once
   * `CmsRefreshTokenService.rotate` has confirmed the presented refresh
   * token is valid. Re-reads the row and rechecks `isActive` rather
   * than trusting the refresh token's mere validity, for the same
   * reason `getCurrentAdmin` does: a refresh token's own row has no
   * opinion on whether the admin was deactivated *after* it was issued,
   * and this is the one path (alongside `getCurrentAdmin`) that must
   * catch that before handing out another working access token.
   */
  async issueAccessTokenForAdminId(id: string): Promise<LoginResult> {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Admin account is no longer active');
    }

    const accessToken = await this.signAccessToken(admin);

    return {
      accessToken,
      admin: this.toIdentityWithPermissions(admin),
    };
  }

  private toIdentityWithPermissions(
    admin: CmsAdminUser,
  ): SafeAdminIdentityWithPermissions {
    return {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      permissions: ROLE_PERMISSIONS[admin.role],
    };
  }

  private signAccessToken(admin: CmsAdminUser): Promise<string> {
    return this.jwt.signAsync(
      { sub: admin.id, email: admin.email, role: admin.role },
      {
        secret: this.jwtSecret,
        issuer: this.jwtIssuer,
        expiresIn: this.jwtExpiresIn,
        algorithm: 'HS256',
      },
    );
  }
}
