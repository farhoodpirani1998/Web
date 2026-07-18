import { ConflictException } from '@nestjs/common';
import { MenusService } from './menus.service';

describe('MenusService', () => {
  const siteId = 'site-1';
  let menuRepo: any;
  let menuItemRepo: any;
  let siteService: any;
  let redis: any;
  let service: MenusService;

  beforeEach(() => {
    menuRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'menu-1', ...data })),
      find: jest.fn(),
      findOneByOrFail: jest.fn(),
      manager: {
        transaction: jest.fn(async (cb) => cb({ delete: jest.fn() })),
      },
    };
    menuItemRepo = {};
    siteService = { getDefaultSiteId: jest.fn().mockReturnValue(siteId) };
    redis = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
      delete: jest.fn(),
      deleteByPrefix: jest.fn(),
    };
    service = new MenusService(menuRepo, menuItemRepo, siteService, redis);
  });

  describe('create', () => {
    it('creates a menu scoped to the default site', async () => {
      const menu = await service.create({ key: 'header', name: 'Header Navigation' });
      expect(menu.siteId).toBe(siteId);
      expect(menu.key).toBe('header');
    });

    it('rejects a key already in use on the same site', async () => {
      menuRepo.findOne.mockResolvedValue({ id: 'menu-existing', key: 'header' });
      await expect(
        service.create({ key: 'header', name: 'Duplicate' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('findAll', () => {
    it('scopes to the default site', async () => {
      await service.findAll();
      expect(menuRepo.find).toHaveBeenCalledWith({
        where: { siteId },
        order: { createdAt: 'ASC' },
      });
    });
  });

  describe('update', () => {
    it('only overwrites fields present on the DTO', async () => {
      menuRepo.findOneByOrFail.mockResolvedValue({
        id: 'menu-1',
        siteId,
        key: 'header',
        name: 'Old Name',
      });

      const updated = await service.update('menu-1', { name: 'New Name' });

      expect(updated.name).toBe('New Name');
      expect(updated.key).toBe('header');
    });

    it('rejects renaming the key to one already in use', async () => {
      menuRepo.findOneByOrFail.mockResolvedValue({
        id: 'menu-1',
        siteId,
        key: 'header',
        name: 'Header',
      });
      menuRepo.findOne.mockResolvedValue({ id: 'menu-other', key: 'footer' });

      await expect(
        service.update('menu-1', { key: 'footer' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('remove', () => {
    it('deletes the menu and its items in one transaction', async () => {
      menuRepo.findOneByOrFail.mockResolvedValue({ id: 'menu-1', siteId });
      const trx = { delete: jest.fn() };
      menuRepo.manager.transaction.mockImplementation(async (cb: any) => cb(trx));

      await service.remove('menu-1');

      expect(trx.delete).toHaveBeenCalledWith(expect.anything(), { menuId: 'menu-1' });
      expect(trx.delete).toHaveBeenCalledWith(expect.anything(), { id: 'menu-1' });
    });
  });
});
