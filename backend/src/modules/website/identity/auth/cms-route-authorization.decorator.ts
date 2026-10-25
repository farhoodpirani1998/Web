import { SetMetadata } from '@nestjs/common';
import { CMS_ANONYMOUS_ENTRY_KEY } from './cms-route-authorization.constants';

/**
 * Declares that a `/admin/*` route is reachable with no verified identity.
 *
 * Exists for `CmsRouteDefaultDenyGuard`, which 403s any CMS route that has
 * not declared an auth policy one way or another. This is the narrowest of
 * those declarations and should stay that way: it is only correct for the
 * token-issuing entrypoints (`login`, `refresh`, `logout`), each of which
 * authenticates from submitted credentials or the refresh cookie inside its
 * own handler. Adding it to a route that reads or writes managed content
 * silently reopens the hole the deny guard was written to close.
 */
export function AllowAnonymousCmsEntry() {
  return SetMetadata(CMS_ANONYMOUS_ENTRY_KEY, true);
}
