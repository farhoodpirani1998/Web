import { UnauthorizedException } from '@nestjs/common';
import { CmsAuthController } from './cms-auth.controller';
import { REFRESH_COOKIE_PATH } from './cms-refresh-cookie.util';

function fakeConfig(overrides: Record<string, string> = {}) {
  return {
    get: jest.fn((key: string) => overrides[key]),
  } as any;
}

function fakeResponse() {
  return { cookie: jest.fn() } as any;
}

function fakeRequest(cookieHeader?: string) {
  return { headers: { cookie: cookieHeader } } as any;
}

describe('CmsAuthController', () => {
  let cmsAuth: any;
  let refreshTokens: any;
  let controller: CmsAuthController;

  beforeEach(() => {
    cmsAuth = {
      login: jest.fn(),
      getCurrentAdmin: jest.fn(),
      issueAccessTokenForAdminId: jest.fn(),
    };
    refreshTokens = {
      issue: jest.fn(),
      rotate: jest.fn(),
      revoke: jest.fn(),
    };
    controller = new CmsAuthController(cmsAuth, refreshTokens, fakeConfig());
  });

  describe('login', () => {
    it('issues a refresh token and sets it as an httpOnly cookie, alongside the access token in the body', async () => {
      cmsAuth.login.mockResolvedValue({
        accessToken: 'access.jwt',
        admin: { id: 'admin-1', email: 'a@example.com', role: 'super_admin' },
      });
      refreshTokens.issue.mockResolvedValue({
        rawToken: 'raw-refresh-token',
        expiresAt: new Date(),
      });
      const res = fakeResponse();

      const result = await controller.login({ email: 'a@example.com', password: 'x' } as any, res);

      expect(refreshTokens.issue).toHaveBeenCalledWith('admin-1', expect.any(Number));
      expect(res.cookie).toHaveBeenCalledWith(
        'cms_refresh_token',
        'raw-refresh-token',
        expect.objectContaining({ httpOnly: true, path: REFRESH_COOKIE_PATH }),
      );
      expect(result.accessToken).toBe('access.jwt');
    });
  });

  describe('refresh', () => {
    it('rejects with 401 when no refresh cookie is present', async () => {
      const req = fakeRequest(undefined);
      const res = fakeResponse();

      await expect(controller.refresh(req, res)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(refreshTokens.rotate).not.toHaveBeenCalled();
    });

    it('clears the cookie and rejects with 401 when rotation fails (invalid/expired/reused token)', async () => {
      const req = fakeRequest('cms_refresh_token=stale-token');
      const res = fakeResponse();
      refreshTokens.rotate.mockResolvedValue(null);

      await expect(controller.refresh(req, res)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(res.cookie).toHaveBeenCalledWith(
        'cms_refresh_token',
        '',
        expect.objectContaining({ maxAge: 0 }),
      );
    });

    it('on success, sets the rotated cookie and returns a fresh access token', async () => {
      const req = fakeRequest('cms_refresh_token=valid-token');
      const res = fakeResponse();
      refreshTokens.rotate.mockResolvedValue({
        adminId: 'admin-1',
        issued: { rawToken: 'new-raw-token', expiresAt: new Date() },
      });
      cmsAuth.issueAccessTokenForAdminId.mockResolvedValue({
        accessToken: 'new.access.jwt',
        admin: { id: 'admin-1', email: 'a@example.com', role: 'super_admin' },
      });

      const result = await controller.refresh(req, res);

      expect(cmsAuth.issueAccessTokenForAdminId).toHaveBeenCalledWith('admin-1');
      expect(res.cookie).toHaveBeenCalledWith(
        'cms_refresh_token',
        'new-raw-token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(result.accessToken).toBe('new.access.jwt');
    });

    it('revokes the just-rotated token and clears the cookie if the admin was deactivated in the meantime', async () => {
      const req = fakeRequest('cms_refresh_token=valid-token');
      const res = fakeResponse();
      refreshTokens.rotate.mockResolvedValue({
        adminId: 'admin-1',
        issued: { rawToken: 'new-raw-token', expiresAt: new Date() },
      });
      cmsAuth.issueAccessTokenForAdminId.mockRejectedValue(new UnauthorizedException());

      await expect(controller.refresh(req, res)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(refreshTokens.revoke).toHaveBeenCalledWith('new-raw-token');
      expect(res.cookie).toHaveBeenCalledWith(
        'cms_refresh_token',
        '',
        expect.objectContaining({ maxAge: 0 }),
      );
    });
  });

  describe('logout', () => {
    it('revokes the presented token and clears the cookie', async () => {
      const req = fakeRequest('cms_refresh_token=some-token');
      const res = fakeResponse();

      await controller.logout(req, res);

      expect(refreshTokens.revoke).toHaveBeenCalledWith('some-token');
      expect(res.cookie).toHaveBeenCalledWith(
        'cms_refresh_token',
        '',
        expect.objectContaining({ maxAge: 0 }),
      );
    });

    it('is a no-op revoke (but still clears the cookie) when there is no cookie to begin with', async () => {
      const req = fakeRequest(undefined);
      const res = fakeResponse();

      await controller.logout(req, res);

      expect(refreshTokens.revoke).not.toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalled();
    });
  });
});
