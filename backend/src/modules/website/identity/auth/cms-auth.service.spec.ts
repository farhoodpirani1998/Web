import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { CmsAuthService } from './cms-auth.service';
import { WebsiteRole, ROLE_PERMISSIONS } from '../../auth/website-role.enum';

describe('CmsAuthService', () => {
  let repo: any;
  let passwordHasher: any;
  let jwt: any;
  let config: any;
  let service: CmsAuthService;

  beforeEach(() => {
    repo = { findOne: jest.fn() };
    passwordHasher = { verify: jest.fn(), hash: jest.fn() };
    jwt = { signAsync: jest.fn().mockResolvedValue('signed.jwt.token') };
    config = {
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
      get: jest.fn((key: string, fallback?: unknown) => fallback),
    };
    service = new CmsAuthService(repo, passwordHasher, jwt, config);
  });

  describe('login', () => {
    it('rejects an unknown email without revealing that to the caller', async () => {
      repo.findOne.mockResolvedValue(null);
      passwordHasher.verify.mockResolvedValue(false);

      await expect(
        service.login({ email: 'nobody@example.com', password: 'whatever12345' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      // Still compares against something, so timing doesn't leak "no such row".
      expect(passwordHasher.verify).toHaveBeenCalled();
    });

    it('rejects a wrong password with the same generic error', async () => {
      repo.findOne.mockResolvedValue({
        id: 'admin-1',
        email: 'admin@example.com',
        passwordHash: 'hash',
        role: WebsiteRole.SUPER_ADMIN,
        isActive: true,
      });
      passwordHasher.verify.mockResolvedValue(false);

      await expect(
        service.login({ email: 'admin@example.com', password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects a correct password on a disabled account', async () => {
      repo.findOne.mockResolvedValue({
        id: 'admin-1',
        email: 'admin@example.com',
        passwordHash: 'hash',
        role: WebsiteRole.CONTENT_EDITOR,
        isActive: false,
      });
      passwordHasher.verify.mockResolvedValue(true);

      await expect(
        service.login({ email: 'admin@example.com', password: 'correct-horse' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('issues an access token and safe identity for a valid active admin', async () => {
      repo.findOne.mockResolvedValue({
        id: 'admin-1',
        email: 'admin@example.com',
        passwordHash: 'hash',
        role: WebsiteRole.PUBLISHER,
        isActive: true,
      });
      passwordHasher.verify.mockResolvedValue(true);

      const result = await service.login({
        email: 'admin@example.com',
        password: 'correct-horse',
      });

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.admin).toEqual({
        id: 'admin-1',
        email: 'admin@example.com',
        role: WebsiteRole.PUBLISHER,
      });
      expect((result.admin as any).passwordHash).toBeUndefined();
      expect(jwt.signAsync).toHaveBeenCalledWith(
        { sub: 'admin-1', email: 'admin@example.com', role: WebsiteRole.PUBLISHER },
        expect.objectContaining({ algorithm: 'HS256' }),
      );
    });
  });

  describe('getCurrentAdmin', () => {
    it('returns identity + permissions for an active admin', async () => {
      repo.findOne.mockResolvedValue({
        id: 'admin-1',
        email: 'admin@example.com',
        role: WebsiteRole.MEDIA_MANAGER,
        isActive: true,
      });

      const result = await service.getCurrentAdmin('admin-1');

      expect(result).toEqual({
        id: 'admin-1',
        email: 'admin@example.com',
        role: WebsiteRole.MEDIA_MANAGER,
        permissions: ROLE_PERMISSIONS[WebsiteRole.MEDIA_MANAGER],
      });
    });

    it('rejects a deactivated admin even with a still-valid token', async () => {
      repo.findOne.mockResolvedValue({
        id: 'admin-1',
        email: 'admin@example.com',
        role: WebsiteRole.MEDIA_MANAGER,
        isActive: false,
      });

      await expect(service.getCurrentAdmin('admin-1')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects an id that no longer exists', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.getCurrentAdmin('gone')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('issueAccessTokenForAdminId', () => {
    it('mints a fresh access token + safe identity for a still-active admin', async () => {
      repo.findOne.mockResolvedValue({
        id: 'admin-1',
        email: 'admin@example.com',
        role: WebsiteRole.PUBLISHER,
        isActive: true,
      });

      const result = await service.issueAccessTokenForAdminId('admin-1');

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.admin).toEqual({
        id: 'admin-1',
        email: 'admin@example.com',
        role: WebsiteRole.PUBLISHER,
      });
    });

    it('rejects an admin deactivated since the refresh token was issued', async () => {
      repo.findOne.mockResolvedValue({
        id: 'admin-1',
        email: 'admin@example.com',
        role: WebsiteRole.PUBLISHER,
        isActive: false,
      });

      await expect(
        service.issueAccessTokenForAdminId('admin-1'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects an id that no longer exists', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.issueAccessTokenForAdminId('gone'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
