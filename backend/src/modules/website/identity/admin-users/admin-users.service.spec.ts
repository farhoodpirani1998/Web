import { BadRequestException, ConflictException } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { CmsAdminUser } from './entities/admin-user.entity';
import { WebsiteRole } from '../../auth/website-role.enum';

/**
 * Unit coverage for the two lockout guards (last-active-super-admin and
 * self-deactivation/deletion) plus the create happy path. The repository
 * is mocked, same convention as every other `.spec.ts` here.
 */
function makeRepo(superAdminOthersCount = 1) {
  const store: CmsAdminUser[] = [];
  return {
    store,
    findOne: jest.fn(({ where }: { where: { id?: string; email?: string } }) =>
      Promise.resolve(
        store.find((a) =>
          where.id ? a.id === where.id : a.email === where.email,
        ) ?? null,
      ),
    ),
    find: jest.fn(() => Promise.resolve([...store])),
    create: jest.fn(
      (partial: Partial<CmsAdminUser>) => partial as CmsAdminUser,
    ),
    save: jest.fn((admin: CmsAdminUser) => {
      if (!store.some((a) => a.id === admin.id)) store.push(admin);
      return Promise.resolve(admin);
    }),
    delete: jest.fn(() => Promise.resolve()),
    // Only `assertNotLastActiveSuperAdmin` builds a query; it just needs a
    // configurable count of "other active super-admins".
    createQueryBuilder: jest.fn(() => {
      const qb = {
        where: () => qb,
        andWhere: () => qb,
        getCount: jest.fn().mockResolvedValue(superAdminOthersCount),
      };
      return qb;
    }),
  };
}

function admin(partial: Partial<CmsAdminUser>): CmsAdminUser {
  return {
    id: partial.id ?? 'id-' + Math.random().toString(36).slice(2),
    email: partial.email ?? 'a@b.com',
    passwordHash: partial.passwordHash ?? 'hash',
    role: partial.role ?? WebsiteRole.CONTENT_EDITOR,
    isActive: partial.isActive ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as CmsAdminUser;
}

function hasherMock() {
  return { hash: jest.fn().mockResolvedValue('hashed'), verify: jest.fn() };
}

describe('AdminUsersService', () => {
  it('creates an admin with a hashed password, active=true, and no hash exposed', async () => {
    const repo = makeRepo();
    const hasher = hasherMock();
    const service = new AdminUsersService(repo as any, hasher as any);

    const created = await service.create({
      email: 'new@example.com',
      password: 'a very long password',
      role: WebsiteRole.CONTENT_EDITOR,
    } as any);

    expect(hasher.hash).toHaveBeenCalledWith('a very long password');
    expect(created.email).toBe('new@example.com');
    expect(created.isActive).toBe(true);
    expect(created).not.toHaveProperty('passwordHash');
  });

  it('rejects a duplicate email with a 409', async () => {
    const repo = makeRepo();
    repo.store.push(admin({ email: 'taken@example.com' }));
    const service = new AdminUsersService(repo as any, hasherMock() as any);

    await expect(
      service.create({
        email: 'taken@example.com',
        password: 'x'.repeat(12),
        role: WebsiteRole.CONTENT_EDITOR,
      } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('refuses to let an admin delete their own account', async () => {
    const repo = makeRepo();
    const me = admin({ role: WebsiteRole.SUPER_ADMIN });
    repo.store.push(me);
    const service = new AdminUsersService(repo as any, hasherMock() as any);

    await expect(service.remove(me.id, me.id)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('refuses to let an admin deactivate their own account', async () => {
    const repo = makeRepo();
    const me = admin({ role: WebsiteRole.SUPER_ADMIN });
    repo.store.push(me);
    const service = new AdminUsersService(repo as any, hasherMock() as any);

    await expect(
      service.update(me.id, { isActive: false }, me.id),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refuses to deactivate the last active super-admin', async () => {
    const repo = makeRepo(0); // zero other active super-admins
    const onlySuper = admin({ role: WebsiteRole.SUPER_ADMIN });
    repo.store.push(onlySuper);
    const service = new AdminUsersService(repo as any, hasherMock() as any);

    // Acting admin is someone else, so the self-guard doesn't short-circuit.
    await expect(
      service.update(onlySuper.id, { isActive: false }, 'someone-else'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('refuses to delete the last active super-admin', async () => {
    const repo = makeRepo(0);
    const onlySuper = admin({ role: WebsiteRole.SUPER_ADMIN });
    repo.store.push(onlySuper);
    const service = new AdminUsersService(repo as any, hasherMock() as any);

    await expect(
      service.remove(onlySuper.id, 'someone-else'),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
