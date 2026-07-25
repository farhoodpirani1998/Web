import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { CmsAuthGuard } from './cms-auth.guard';
import { WebsiteRole } from '../../auth/website-role.enum';

function contextWithHeader(authorization?: string): ExecutionContext {
  const request = { headers: authorization ? { authorization } : {} } as any;
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as ExecutionContext;
}

describe('CmsAuthGuard', () => {
  let jwt: any;
  let config: any;
  let guard: CmsAuthGuard;

  beforeEach(() => {
    jwt = { verifyAsync: jest.fn() };
    config = {
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
      get: jest.fn((key: string, fallback?: unknown) => fallback ?? 'nhg-cms'),
    };
    guard = new CmsAuthGuard(jwt, config);
  });

  it('rejects a missing bearer token', async () => {
    await expect(guard.canActivate(contextWithHeader(undefined))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('enforces the issuer via verifyAsync options, not a separate check', async () => {
    jwt.verifyAsync.mockResolvedValue({
      sub: 'admin-1',
      email: 'admin@example.com',
      role: WebsiteRole.CONTENT_EDITOR,
      iss: 'someone-else',
    });
    // jwt.verifyAsync is mocked here, so it won't actually reject a
    // mismatched issuer itself — this test only confirms the guard
    // *asks* the library to enforce it, since that's what collapses
    // "wrong issuer" and "bad signature" into the same generic error
    // in the real (unmocked) library.
    await guard.canActivate(contextWithHeader('Bearer some.jwt.token'));

    expect(jwt.verifyAsync).toHaveBeenCalledWith(
      'some.jwt.token',
      expect.objectContaining({ issuer: 'nhg-cms', algorithms: ['HS256'] }),
    );
  });

  it('rejects a token whose role is not a recognized WebsiteRole', async () => {
    jwt.verifyAsync.mockResolvedValue({
      sub: 'admin-1',
      email: 'admin@example.com',
      role: 'some_decommissioned_role',
      iss: 'nhg-cms',
    });

    await expect(
      guard.canActivate(contextWithHeader('Bearer some.jwt.token')),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('attaches a safe request.user for a valid token', async () => {
    jwt.verifyAsync.mockResolvedValue({
      sub: 'admin-1',
      email: 'admin@example.com',
      role: WebsiteRole.PUBLISHER,
      iss: 'nhg-cms',
    });
    const request = { headers: { authorization: 'Bearer some.jwt.token' } } as any;
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as ExecutionContext;

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.user).toEqual({
      id: 'admin-1',
      email: 'admin@example.com',
      role: WebsiteRole.PUBLISHER,
    });
  });

  it('rejects when verifyAsync itself throws (bad signature/expired/wrong issuer)', async () => {
    jwt.verifyAsync.mockRejectedValue(new Error('jwt expired'));

    await expect(
      guard.canActivate(contextWithHeader('Bearer some.jwt.token')),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
