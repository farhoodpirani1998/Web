import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface WebsiteRequestUser {
  externalUserId: string;
  email?: string;
  name?: string;
}

/**
 * Reads the identity WebsiteAuthGuard attaches to the request. Purely a
 * convenience for controllers that need the acting user's id (e.g. to
 * stamp `authorId` on a ContentRevision) — it does not itself guard
 * anything; routes still need @RequireWebsitePermission for that.
 */
export const CurrentWebsiteUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): WebsiteRequestUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
