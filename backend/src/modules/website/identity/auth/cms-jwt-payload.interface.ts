import { WebsiteRole } from '../../auth/website-role.enum';

/**
 * Shape of a CMS access token's payload. Deliberately unrelated to
 * `SmsJwtPayload` (`auth/website-auth.guard.ts`) — different issuer,
 * different signing key/algorithm (HS256 with a local secret, not
 * SMS's RS256 public key), and no shared claim names beyond `sub`/`exp`
 * being generic JWT conventions. A CMS token is never valid where an
 * SMS token is expected or vice versa.
 */
export interface CmsJwtPayload {
  /** CmsAdminUser.id — this backend's own local identity, never an SMS externalUserId. */
  sub: string;
  email: string;
  role: WebsiteRole;
  iss: string;
  iat: number;
  exp: number;
}

/** What `CmsAuthGuard` attaches to `request.user` for CMS-authenticated routes. */
export interface CmsRequestUser {
  id: string;
  email: string;
  role: WebsiteRole;
}
