import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CmsRequestUser } from './cms-jwt-payload.interface';

/**
 * Reads the identity `CmsAuthGuard` attaches to the request. Mirrors
 * `CurrentWebsiteUser` (`auth/current-website-user.decorator.ts`) —
 * same convenience-only role, no guarding of its own. Named distinctly
 * (`CurrentAdmin`, not `CurrentWebsiteUser`) so the two are never
 * accidentally interchangeable at a call site: a `CmsRequestUser` has
 * an `id` (this backend's own `CmsAdminUser.id`) where a
 * `WebsiteRequestUser` has an `externalUserId` (SMS's), and the two
 * are not the same identity space.
 */
export const CurrentAdmin = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): CmsRequestUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
