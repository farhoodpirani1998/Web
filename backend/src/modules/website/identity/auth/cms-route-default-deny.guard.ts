import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { WebsiteAuthGuard } from '../../auth/website-auth.guard';
import { PERMISSION_KEY } from '../../auth/website-permission.constants';
import { CmsAuthGuard } from './cms-auth.guard';
import { CMS_PERMISSION_KEY } from './cms-permission.constants';
import { CMS_ANONYMOUS_ENTRY_KEY } from './cms-route-authorization.constants';

/**
 * Guards that already verify an identity and put it on `request.user`.
 * A route carrying one of these has declared its auth policy, even when the
 * decorator that applied it sets no metadata of its own
 * (`RequireWebsiteSuperAdmin` is exactly that case).
 */
const IDENTITY_GUARDS = [CmsAuthGuard, WebsiteAuthGuard] as const;

/** Metadata keys that each mean "this route's auth policy was declared". */
const POLICY_KEYS = [
  CMS_PERMISSION_KEY,
  PERMISSION_KEY,
  CMS_ANONYMOUS_ENTRY_KEY,
] as const;

const CMS_PATH_ROOT = '/admin';

function isCmsRoutePath(path: unknown): path is string {
  return (
    typeof path === 'string' &&
    (path === CMS_PATH_ROOT || path.startsWith(`${CMS_PATH_ROOT}/`))
  );
}

function isIdentityGuard(entry: unknown): boolean {
  if (typeof entry === 'function')
    return (IDENTITY_GUARDS as readonly unknown[]).includes(entry);
  if (entry && typeof entry === 'object') {
    return (IDENTITY_GUARDS as readonly unknown[]).includes(entry.constructor);
  }
  return false;
}

/**
 * Fails closed on every `/admin/*` route nobody gave an auth policy to.
 *
 * `CmsPermissionGuard` and `WebsitePermissionGuard` both answer "no
 * permission was required here" by returning `true`, which is the right call
 * for a guard whose only job is the permission check — but it means coverage
 * depended entirely on every future controller author remembering to put a
 * decorator on. All 26 CMS controllers are covered today; this guard is what
 * makes "forgot the decorator" a 403 instead of an unauthenticated write.
 *
 * Registered as `APP_GUARD` after `ThrottlerGuard`, and it deliberately reads
 * metadata rather than `request.user`: global guards run before controller
 * guards, so no identity has been attached at this point in the pipeline.
 */
@Injectable()
export class CmsRouteDefaultDenyGuard implements CanActivate {
  private readonly logger = new Logger(CmsRouteDefaultDenyGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!isCmsRoutePath(request?.path)) return true;

    const contexts = [context.getHandler(), context.getClass()];
    const declaresPolicy = POLICY_KEYS.some((key) =>
      this.reflector.getAllAndOverride<boolean>(key, contexts),
    );
    if (declaresPolicy) return true;

    const guards =
      this.reflector.getAllAndMerge<unknown[]>(GUARDS_METADATA, contexts) ?? [];
    if (guards.some(isIdentityGuard)) return true;

    const handlerName = context.getHandler()?.name ?? 'unknown';
    this.logger.error(
      `Blocked ${request.method} ${request.path}: handler ${handlerName} declares no auth policy. ` +
        `Add @RequireCmsPermission(), @RequireWebsitePermission(), an identity guard, ` +
        `or @AllowAnonymousCmsEntry() if it is a token entrypoint.`,
    );
    throw new ForbiddenException('Route authorization policy not declared');
  }
}
