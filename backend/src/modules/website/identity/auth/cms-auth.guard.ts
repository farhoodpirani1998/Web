import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CmsJwtPayload } from './cms-jwt-payload.interface';
import { WebsiteRole } from '../../auth/website-role.enum';

/**
 * Verifies a CMS access token's signature/issuer/expiry and attaches
 * the decoded identity to `request.user`. This is the CMS Admin
 * counterpart to `WebsiteAuthGuard` (`auth/website-auth.guard.ts`) —
 * same shape/role, but intentionally not reused from or merged with
 * it: that guard trusts SMS's externally-issued RS256 tokens against
 * SMS's public key, while this guard verifies tokens *this backend
 * itself issued* (`CmsAuthService.login`) against a local HS256
 * secret. Sharing one guard between the two would mean a token from
 * either system could plausibly authenticate the other's routes,
 * exactly the coupling the architecture decision (see
 * `CmsAdminUser`'s doc comment) rules out.
 *
 * Stateless by design, same as `WebsiteAuthGuard`: no database lookup
 * happens here, only signature/issuer/expiry verification. That means
 * deactivating a `CmsAdminUser` (`isActive = false`) does not
 * invalidate an access token already issued to them — it only
 * prevents *new* logins and is reflected the next time `GET
 * /admin/auth/me` re-reads the row. This is an accepted, documented
 * tradeoff (see Sprint 2.3A report's Security Decisions and Sprint
 * 2.3B's Remaining Work) mitigated by a short token expiry
 * (`CMS_JWT_EXPIRES_IN`); a revocation list or refresh-token scheme
 * remains explicitly out of scope.
 *
 * Sprint 2.3B hardening: issuer is now enforced by `jwt.verifyAsync`'s
 * own `issuer` option instead of a separate manual comparison after
 * the fact. Previously a bad signature and a wrong issuer produced two
 * different messages ("Invalid or expired token" vs "Unexpected token
 * issuer") from two different code paths — a caller could use that
 * distinction to learn which check failed. Folding issuer verification
 * into the same `verifyAsync` call means every failure mode (bad
 * signature, wrong algorithm, expired, wrong issuer) now goes through
 * the one catch block below and returns the one generic message.
 */
@Injectable()
export class CmsAuthGuard implements CanActivate {
  private readonly secret: string;
  private readonly expectedIssuer: string;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    this.secret = this.config.getOrThrow<string>('CMS_JWT_SECRET');
    this.expectedIssuer = this.config.get<string>('CMS_JWT_ISSUER') ?? 'nhg-cms';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const token = authHeader.slice('Bearer '.length);

    let payload: CmsJwtPayload;
    try {
      payload = await this.jwt.verifyAsync<CmsJwtPayload>(token, {
        secret: this.secret,
        algorithms: ['HS256'],
        issuer: this.expectedIssuer,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Defensive check, not a normal-path concern: every token in
    // circulation was signed by this backend with a `role` drawn from
    // `WebsiteRole` (see CmsAuthService.signAccessToken), so this only
    // matters for a token minted before a future removal of a role
    // from the enum and still unexpired. Rejecting it here rather than
    // trusting it blindly means a stale/decommissioned role can never
    // silently authorize a request.
    if (!Object.values(WebsiteRole).includes(payload.role)) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    request.user = { id: payload.sub, email: payload.email, role: payload.role };
    return true;
  }
}

