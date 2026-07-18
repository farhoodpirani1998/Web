import { BadRequestException, ConflictException } from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { MenuItemLinkType } from './entities/menu-item-link-type.enum';

describe('MenuItemsService', () => {
  const siteId = 'site-1';
  const menuId = 'menu-1';
  let menuItemRepo: any;
  let siteService: any;
  let ordering: any;
  let menusService: any;
  let pagesService: any;
  let redis: any;
  let service: MenuItemsService;

  beforeEach(() => {
    menuItemRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'item-1', ...data })),
      findOneByOrFail: jest.fn(),
      delete: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      manager: {},
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: null }),
        getMany: jest.fn().mockResolvedValue([]),
      }),
    };
    siteService = { getDefaultSiteId: jest.fn().mockReturnValue(siteId) };
    ordering = { reorder: jest.fn() };
    menusService = { findOne: jest.fn().mockResolvedValue({ id: menuId, siteId }) };
    pagesService = { findOne: jest.fn().mockResolvedValue({ id: 'page-1', siteId }) };
    redis = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
      delete: jest.fn(),
      deleteByPrefix: jest.fn(),
    };
    service = new MenuItemsService(
      menuItemRepo,
      siteService,
      ordering,
      menusService,
      pagesService,
      redis,
    );
  });

  describe('create', () => {
    it('creates a top-level page-linked item at position 0', async () => {
      const item = await service.create({
        menuId,
        label: { fa: 'درباره ما' },
        linkType: MenuItemLinkType.PAGE,
        pageId: 'page-1',
      });

      expect(item.siteId).toBe(siteId);
      expect(item.position).toBe(0);
      expect(item.pageId).toBe('page-1');
      expect(item.url).toBeUndefined();
    });

    it('creates an external-link item', async () => {
      const item = await service.create({
        menuId,
        label: { fa: 'وبسایت' },
        linkType: MenuItemLinkType.EXTERNAL,
        url: 'https://example.com',
      });

      expect(item.url).toBe('https://example.com');
      expect(item.pageId).toBeUndefined();
    });

    it('rejects an unknown menuId', async () => {
      menusService.findOne.mockRejectedValue(new Error('not found'));
      await expect(
        service.create({
          menuId: 'missing-menu',
          label: { fa: 'x' },
          linkType: MenuItemLinkType.EXTERNAL,
          url: 'https://example.com',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a page link with no pageId', async () => {
      await expect(
        service.create({
          menuId,
          label: { fa: 'x' },
          linkType: MenuItemLinkType.PAGE,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects an external link that also sets pageId', async () => {
      await expect(
        service.create({
          menuId,
          label: { fa: 'x' },
          linkType: MenuItemLinkType.EXTERNAL,
          url: 'https://example.com',
          pageId: 'page-1',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a pageId that does not resolve on this site', async () => {
      pagesService.findOne.mockResolvedValue({ id: 'page-1', siteId: 'other-site' });
      await expect(
        service.create({
          menuId,
          label: { fa: 'x' },
          linkType: MenuItemLinkType.PAGE,
          pageId: 'page-1',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a parentId belonging to a different menu', async () => {
      menuItemRepo.findOne.mockResolvedValue(null);
      await expect(
        service.create({
          menuId,
          parentId: 'item-other-menu',
          label: { fa: 'x' },
          linkType: MenuItemLinkType.EXTERNAL,
          url: 'https://example.com',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('update', () => {
    it('rejects a parentId that would create a cycle', async () => {
      menuItemRepo.findOneByOrFail.mockResolvedValue({
        id: 'item-1',
        siteId,
        menuId,
        parentId: undefined,
        linkType: MenuItemLinkType.EXTERNAL,
        url: 'https://example.com',
      });
      // Walking up from the proposed parent leads straight back to item-1.
      menuItemRepo.findOne.mockResolvedValueOnce({ id: 'item-2', parentId: undefined });

      await expect(
        service.update('item-1', { parentId: 'item-1' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('only overwrites fields present on the DTO', async () => {
      menuItemRepo.findOneByOrFail.mockResolvedValue({
        id: 'item-1',
        siteId,
        menuId,
        label: { fa: 'قدیمی' },
        linkType: MenuItemLinkType.EXTERNAL,
        url: 'https://old.example.com',
        visible: true,
      });

      const updated = await service.update('item-1', { visible: false });

      expect(updated.visible).toBe(false);
      expect(updated.url).toBe('https://old.example.com');
      expect(updated.label).toEqual({ fa: 'قدیمی' });
    });
  });

  describe('remove', () => {
    it('rejects deleting an item that still has children', async () => {
      menuItemRepo.findOneByOrFail.mockResolvedValue({ id: 'item-1', siteId, menuId });
      menuItemRepo.count.mockResolvedValue(2);

      await expect(service.remove('item-1')).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('reorder', () => {
    it('delegates to OrderingService when orderedIds exactly match the sibling set', async () => {
      menuItemRepo.createQueryBuilder().getMany.mockResolvedValue([
        { id: 'a' },
        { id: 'b' },
      ]);

      await service.reorder(menuId, null, ['b', 'a']);

      expect(ordering.reorder).toHaveBeenCalledWith(
        menuItemRepo.manager,
        'menu_items',
        ['b', 'a'],
      );
    });

    it('rejects an orderedIds list that does not match the sibling set', async () => {
      menuItemRepo.createQueryBuilder().getMany.mockResolvedValue([{ id: 'a' }, { id: 'b' }]);

      await expect(service.reorder(menuId, null, ['a'])).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(ordering.reorder).not.toHaveBeenCalled();
    });
  });
});
