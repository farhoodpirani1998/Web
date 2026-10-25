import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { GUARDS_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import 'reflect-metadata';
import {
  WebsitePermission,
  WebsiteRole,
  ROLE_PERMISSIONS,
} from '../../auth/website-role.enum';
import { WebsiteAuthGuard } from '../../auth/website-auth.guard';
import { PERMISSION_KEY } from '../../auth/website-permission.constants';
import { CmsAuthGuard } from './cms-auth.guard';
import { CMS_PERMISSION_KEY } from './cms-permission.constants';
import { CMS_ANONYMOUS_ENTRY_KEY } from './cms-route-authorization.constants';
import { CmsRouteDefaultDenyGuard } from './cms-route-default-deny.guard';
import { CmsAuthController } from './cms-auth.controller';

/**
 * Builds the minimal `ExecutionContext` the guard reads: the request path,
 * plus the handler/class pair `Reflector` resolves metadata from. Everything
 * is set with real metadata keys so the test exercises the same lookup the
 * decorators perform in the app, rather than stubbing `Reflector` itself.
 */
function contextFor(
  path: string,
  handler: CallableFunction,
  owner?: object,
): ExecutionContext {
  const request = { path, method: 'GET' };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => handler,
    getClass: () => owner ?? class {},
  } as unknown as ExecutionContext;
}

function bareHandler(): CallableFunction {
  return function someAdminRoute() {};
}

describe('CmsRouteDefaultDenyGuard', () => {
  let reflector: Reflector;
  let guard: CmsRouteDefaultDenyGuard;
  const adminPath = '/admin/news';

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    reflector = new Reflector();
    guard = new CmsRouteDefaultDenyGuard(reflector);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('stays out of the way for non-CMS routes', () => {
    expect(guard.canActivate(contextFor('/public/news', bareHandler()))).toBe(
      true,
    );
    expect(guard.canActivate(contextFor('/health', bareHandler()))).toBe(true);
  });

  it('does not treat a path that merely starts with "admin" as the CMS surface', () => {
    expect(guard.canActivate(contextFor('/administrator', bareHandler()))).toBe(
      true,
    );
  });

  it('blocks an /admin route that declared no auth policy', () => {
    expect(() =>
      guard.canActivate(contextFor(adminPath, bareHandler())),
    ).toThrow(ForbiddenException);
  });

  it('blocks the bare /admin path too, not only its children', () => {
    expect(() =>
      guard.canActivate(contextFor('/admin', bareHandler())),
    ).toThrow(ForbiddenException);
  });

  it('allows a route carrying RequireCmsPermission', () => {
    const handler = bareHandler();
    Reflect.defineMetadata(
      CMS_PERMISSION_KEY,
      WebsitePermission.CONTENT_WRITE,
      handler,
    );
    expect(guard.canActivate(contextFor(adminPath, handler))).toBe(true);
  });

  it('allows a route carrying the SMS-side permission decorator', () => {
    const handler = bareHandler();
    Reflect.defineMetadata(
      PERMISSION_KEY,
      WebsitePermission.CONTENT_READ,
      handler,
    );
    expect(guard.canActivate(contextFor(adminPath, handler))).toBe(true);
  });

  it('allows a route explicitly declared anonymous', () => {
    const handler = bareHandler();
    Reflect.defineMetadata(CMS_ANONYMOUS_ENTRY_KEY, true, handler);
    expect(guard.canActivate(contextFor(adminPath, handler))).toBe(true);
  });

  it('allows a route whose only declaration is a bare identity guard', () => {
    const handler = bareHandler();
    Reflect.defineMetadata(GUARDS_METADATA, [CmsAuthGuard], handler);
    expect(guard.canActivate(contextFor(adminPath, handler))).toBe(true);
  });

  it('reads identity guards declared at class level, as RequireWebsiteSuperAdmin does', () => {
    const owner = class AdminRolesController {};
    Reflect.defineMetadata(GUARDS_METADATA, [WebsiteAuthGuard], owner);
    expect(
      guard.canActivate(
        contextFor('/admin/role-assignments', bareHandler(), owner),
      ),
    ).toBe(true);
  });

  it('does not mistake an unrelated guard for a verified identity', () => {
    const handler = bareHandler();
    Reflect.defineMetadata(GUARDS_METADATA, [class SomeOtherGuard {}], handler);
    expect(() => guard.canActivate(contextFor(adminPath, handler))).toThrow(
      ForbiddenException,
    );
  });

  /**
   * The auth controller is the one place with deliberately unauthenticated
   * routes, so it is checked against the real class rather than a fixture.
   * Only methods Nest actually registered as routes are considered — the
   * prototype also carries private cookie helpers that are not endpoints and
   * correctly declare nothing.
   */
  describe('the real CmsAuthController', () => {
    const prototype = CmsAuthController.prototype as unknown as Record<
      string,
      CallableFunction
    >;
    const handlers = Object.getOwnPropertyNames(prototype).filter(
      (name) =>
        name !== 'constructor' &&
        typeof prototype[name] === 'function' &&
        Reflect.hasMetadata(METHOD_METADATA, prototype[name]),
    );

    it('finds the expected route set', () => {
      expect(handlers.sort()).toEqual(
        ['changePassword', 'login', 'logout', 'me', 'refresh'].sort(),
      );
    });

    it.each(handlers)('declares a policy for %s', (name) => {
      expect(() =>
        guard.canActivate(
          contextFor('/admin/auth/x', prototype[name], CmsAuthController),
        ),
      ).not.toThrow();
    });
  });

  it('keeps the SMS-side permission model independent of CMS keys', () => {
    // Guards against the two decorator families being collapsed onto one
    // metadata key: a handler marked only with the website key must still be
    // recognised, and ROLE_PERMISSIONS must still describe it.
    const handler = bareHandler();
    Reflect.defineMetadata(
      PERMISSION_KEY,
      WebsitePermission.CONTENT_WRITE,
      handler,
    );
    expect(guard.canActivate(contextFor(adminPath, handler))).toBe(true);
    expect(ROLE_PERMISSIONS[WebsiteRole.SUPER_ADMIN]).toContain(
      WebsitePermission.CONTENT_WRITE,
    );
  });
});
