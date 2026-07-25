import { CmsRefreshTokenService } from './cms-refresh-token.service';
import { hashRefreshToken } from './refresh-token-hash.util';

describe('CmsRefreshTokenService', () => {
  let repo: any;
  let service: CmsRefreshTokenService;
  let queryBuilder: any;

  beforeEach(() => {
    queryBuilder = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    repo = {
      insert: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    service = new CmsRefreshTokenService(repo);
  });

  describe('issue', () => {
    it('persists a hash of the token, never the raw value, leaving revocation columns unset', async () => {
      const { rawToken } = await service.issue('admin-1', 1000);

      expect(repo.insert).toHaveBeenCalledWith({
        adminId: 'admin-1',
        tokenHash: hashRefreshToken(rawToken),
        expiresAt: expect.any(Date),
      });
    });

    it('sets expiresAt ttlMs in the future', async () => {
      const before = Date.now();
      const { expiresAt } = await service.issue('admin-1', 60_000);
      expect(expiresAt.getTime()).toBeGreaterThanOrEqual(before + 60_000);
    });
  });

  describe('rotate', () => {
    it('returns null when the conditional claim affects no row and no row exists at all', async () => {
      queryBuilder.execute.mockResolvedValue({ affected: 0 });
      repo.findOne.mockResolvedValue(null);

      const result = await service.rotate('unknown-token', 1000);

      expect(result).toBeNull();
      expect(repo.createQueryBuilder).toHaveBeenCalledTimes(1);
    });

    it('returns null for an expired-but-not-revoked token, without treating it as reuse', async () => {
      queryBuilder.execute.mockResolvedValue({ affected: 0 });
      repo.findOne.mockResolvedValue({
        adminId: 'admin-1',
        tokenHash: 'hash',
        revokedAt: undefined,
        expiresAt: new Date(Date.now() - 1000),
      });

      const result = await service.rotate('expired-token', 1000);

      expect(result).toBeNull();
      // Only the (failed) claim update — no reuse sweep for a merely-expired token.
      expect(repo.createQueryBuilder).toHaveBeenCalledTimes(1);
    });

    it('does not sweep the admin\'s other tokens when the presented token was revoked moments ago (benign race, e.g. two tabs or StrictMode double-invoke)', async () => {
      queryBuilder.execute.mockResolvedValue({ affected: 0 });
      repo.findOne.mockResolvedValue({
        adminId: 'admin-1',
        tokenHash: 'hash',
        revokedAt: new Date(Date.now() - 1_000), // well within the grace window
        expiresAt: new Date(Date.now() + 60_000),
      });

      const result = await service.rotate('reused-token', 1000);

      expect(result).toBeNull();
      // Only the failed claim attempt — no reuse sweep.
      expect(repo.createQueryBuilder).toHaveBeenCalledTimes(1);
    });

    it('revokes every valid token for the admin when a token revoked well outside the grace window is reused', async () => {
      queryBuilder.execute.mockResolvedValue({ affected: 0 });
      repo.findOne.mockResolvedValue({
        adminId: 'admin-1',
        tokenHash: 'hash',
        revokedAt: new Date(Date.now() - 60_000), // well past the grace window
        expiresAt: new Date(Date.now() + 60_000),
      });

      const result = await service.rotate('reused-token', 1000);

      expect(result).toBeNull();
      // The failed claim attempt + the reuse-sweep's own update — both via createQueryBuilder.
      expect(repo.createQueryBuilder).toHaveBeenCalledTimes(2);
    });

    it('on a valid token, atomically claims it, issues a successor, and records the rotation chain', async () => {
      queryBuilder.execute.mockResolvedValue({ affected: 1 });
      repo.findOne.mockResolvedValue({
        adminId: 'admin-1',
        tokenHash: 'old-hash',
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
      });

      const result = await service.rotate('valid-token', 60_000);

      expect(result).not.toBeNull();
      expect(result!.adminId).toBe('admin-1');
      expect(repo.insert).toHaveBeenCalled(); // the new token from `issue`
      expect(repo.update).toHaveBeenCalledWith(
        { tokenHash: hashRefreshToken('valid-token') },
        { replacedByTokenHash: hashRefreshToken(result!.issued.rawToken) },
      );
    });

    it("does not sweep the admin's other tokens on a successful rotation", async () => {
      queryBuilder.execute.mockResolvedValue({ affected: 1 });
      repo.findOne.mockResolvedValue({
        adminId: 'admin-1',
        tokenHash: 'old-hash',
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
      });

      await service.rotate('valid-token', 60_000);

      // Exactly one createQueryBuilder call: the claim itself. No second
      // (revokeAllForAdmin) call on the success path.
      expect(repo.createQueryBuilder).toHaveBeenCalledTimes(1);
    });
  });

  describe('revoke', () => {
    it('revokes only the matching, still-valid row', async () => {
      await service.revoke('some-token');

      expect(queryBuilder.where).toHaveBeenCalledWith(
        '"tokenHash" = :tokenHash',
        { tokenHash: hashRefreshToken('some-token') },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('"revokedAt" IS NULL');
      expect(queryBuilder.execute).toHaveBeenCalled();
    });
  });

  describe('revokeAllForAdmin', () => {
    it('revokes every currently-valid token for the given admin', async () => {
      await service.revokeAllForAdmin('admin-1');

      expect(queryBuilder.where).toHaveBeenCalledWith('"adminId" = :adminId', {
        adminId: 'admin-1',
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('"revokedAt" IS NULL');
      expect(queryBuilder.execute).toHaveBeenCalled();
    });
  });
});
