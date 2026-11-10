import { WebsiteRole } from '../../auth/website-role.enum';

/**
 * Shape of a CMS access token's payload.
 */
export interface CmsJwtPayload {
  /** CmsAdminUser.id — this backend's local identity. */
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
