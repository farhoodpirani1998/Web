import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CmsRequestUser } from './cms-jwt-payload.interface';

/**
 * Reads the identity `CmsAuthGuard` attaches to the request. This is
 * convenience-only and does not provide route protection.
 */
export const CurrentAdmin = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): CmsRequestUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
