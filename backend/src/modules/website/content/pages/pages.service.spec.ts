import { BadRequestException, ConflictException } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

describe('PagesService', () => {
  const siteId = 'site-1';
  let repo: any;
  let siteService: any;
  let publishing: any;
  let media: any;
  let sitemap: any;
  let revisions: any;
  let service: PagesService;

  beforeEach(() => {
    repo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'page-1', ...data })),
      findOneByOrFail: jest.fn(),
      delete: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      manager: {
        transaction: jest.fn(async (cb) => cb({ update: jest.fn() })),
      },
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }),
    };
    siteService = { getDefaultSiteId: jest.fn().mockReturnValue(siteId) };
    publishing = { transition: jest.fn() };
    media = { attach: jest.fn(), detach: jest.fn() };
    sitemap = { register: jest.fn() };
    revisions = {
      record: jest.fn(),
      list: jest.fn(),
      getVersion: jest.fn(),
    };
    service = new PagesService(repo, siteService, publishing, media, sitemap, revisions);
  });

  describe('onModuleInit', () => {
    it('registers a sitemap provider', () => {
      service.onModuleInit();
      expect(sitemap.register).toHaveBeenCalledWith(expect.any(Function));
    });

    it('maps the homepage page to "/" and other pages to "/{slug}"', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([
        { id: 'p1', slug: 'home', isHomepage: true, publishAt: undefined, updatedAt: new Date() } as any,
        { id: 'p2', slug: 'about-us', isHomepage: false, publishAt: undefined, updatedAt: new Date() } as any,
      ]);

      service.onModuleInit();
      const provider = sitemap.register.mock.calls[0][0];
      const entries = await provider();

      expect(entries).toEqual([
        { loc: '/', lastmod: expect.any(Date) },
        { loc: '/about-us', lastmod: expect.any(Date) },
      ]);
    });

    it('withholds a published page whose publishAt is still in the future', async () => {
      const future = new Date(Date.now() + 86_400_000);
      jest
        .spyOn(service, 'findAll')
        .mockResolvedValue([{ id: 'p1', slug: 'future-page', publishAt: future, updatedAt: new Date() } as any]);

      service.onModuleInit();
      const provider = sitemap.register.mock.calls[0][0];
      const entries = await provider();

      expect(entries).toEqual([]);
    });
  });

  describe('create', () => {
    it('creates a page as DRAFT with default template and menu visibility', async () => {
      const page = await service.create(
        { title: { fa: 'صفحه' }, slug: 'my-page', body: { fa: 'متن' } } as any,
        'author-1',
      );

      expect(page.status).toBe(PublishStatus.DRAFT);
      expect(page.template).toBe('default');
      expect(page.showInMenu).toBe(true);
      expect(page.siteId).toBe(siteId);
      expect(revisions.record).toHaveBeenCalledWith(
        'static_page',
        'page-1',
        expect.objectContaining({ slug: 'my-page' }),
        'author-1',
      );
    });

    it('rejects a slug already used on this site', async () => {
      repo.findOne.mockResolvedValue({ id: 'other-page' });

      await expect(
        service.create(
          { title: { fa: 'عنوان' }, slug: 'taken-slug', body: { fa: 'متن' } } as any,
          'author-1',
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects a parentId that does not exist on this site', async () => {
      repo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

      await expect(
        service.create(
          {
            title: { fa: 'عنوان' },
            slug: 'child-page',
            body: { fa: 'متن' },
            parentId: 'missing-parent',
          } as any,
          'author-1',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('update', () => {
    it('re-checks slug uniqueness only when the slug actually changes', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'page-1',
        siteId,
        slug: 'old-slug',
        status: PublishStatus.DRAFT,
      });

      await service.update('page-1', { showInMenu: false } as any, 'author-1');

      expect(repo.findOne).not.toHaveBeenCalled();
    });

    it('rejects setting a page as its own parent', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'page-1',
        siteId,
        slug: 'a-page',
        status: PublishStatus.DRAFT,
      });
      // assertValidParent looks up the requested parent first — return
      // the page itself, so the ancestor walk immediately hits pageId.
      repo.findOne.mockResolvedValue({ id: 'page-1', siteId, parentId: undefined });

      await expect(
        service.update('page-1', { parentId: 'page-1' } as any, 'author-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a parentId that would create a deeper cycle', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'page-1',
        siteId,
        slug: 'a-page',
        status: PublishStatus.DRAFT,
      });
      // page-2 (the requested new parent) is itself a child of page-1.
      repo.findOne.mockImplementation(({ where }: any) => {
        if (where.id === 'page-2') {
          return Promise.resolve({ id: 'page-2', siteId, parentId: 'page-1' });
        }
        return Promise.resolve(null);
      });

      await expect(
        service.update('page-1', { parentId: 'page-2' } as any, 'author-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('clears the parent when parentId is explicitly null', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'page-1',
        siteId,
        slug: 'a-page',
        parentId: 'old-parent',
        status: PublishStatus.DRAFT,
      });

      const result = await service.update('page-1', { parentId: null } as any, 'author-1');

      expect(result.parentId).toBeUndefined();
    });

    it('detaches the old featured image and attaches the new one when it changes', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'page-1',
        siteId,
        slug: 'a-page',
        featuredImageMediaId: 'media-old',
        status: PublishStatus.DRAFT,
      });

      await service.update('page-1', { featuredImageMediaId: 'media-new' } as any, 'author-1');

      expect(media.detach).toHaveBeenCalledWith('media-old', 'static_page', 'page-1');
      expect(media.attach).toHaveBeenCalledWith('media-new', 'static_page', 'page-1');
    });
  });

  describe('remove', () => {
    it('rejects deleting a page that still has children', async () => {
      repo.findOneByOrFail.mockResolvedValue({ id: 'page-1', siteId });
      repo.count.mockResolvedValue(2);

      await expect(service.remove('page-1')).rejects.toBeInstanceOf(ConflictException);
      expect(repo.delete).not.toHaveBeenCalled();
    });

    it('detaches the featured image before deleting a childless page', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'page-1',
        siteId,
        featuredImageMediaId: 'media-1',
      });
      repo.count.mockResolvedValue(0);

      await service.remove('page-1');

      expect(media.detach).toHaveBeenCalledWith('media-1', 'static_page', 'page-1');
      expect(repo.delete).toHaveBeenCalledWith({ id: 'page-1' });
    });
  });

  describe('updateStatus', () => {
    it('clears isHomepage when a homepage page is moved off PUBLISHED', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'page-1',
        siteId,
        status: PublishStatus.PUBLISHED,
        isHomepage: true,
      });

      const result = await service.updateStatus('page-1', PublishStatus.ARCHIVED);

      expect(result.isHomepage).toBe(false);
    });
  });

  describe('setHomepage', () => {
    it('rejects designating a non-published page as the homepage', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'page-1',
        siteId,
        status: PublishStatus.DRAFT,
      });

      await expect(service.setHomepage('page-1', true)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('unsets any previous homepage before setting the new one, in a transaction', async () => {
      repo.findOneByOrFail
        .mockResolvedValueOnce({ id: 'page-2', siteId, status: PublishStatus.PUBLISHED })
        .mockResolvedValueOnce({ id: 'page-2', siteId, status: PublishStatus.PUBLISHED, isHomepage: true });

      const trxUpdate = jest.fn();
      repo.manager.transaction.mockImplementation(async (cb: any) => cb({ update: trxUpdate }));

      const result = await service.setHomepage('page-2', true);

      expect(trxUpdate).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        { siteId, isHomepage: true },
        { isHomepage: false },
      );
      expect(trxUpdate).toHaveBeenNthCalledWith(
        2,
        expect.anything(),
        { id: 'page-2' },
        { isHomepage: true },
      );
      expect(result.isHomepage).toBe(true);
    });

    it('clears the homepage flag without needing a transaction', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'page-1',
        siteId,
        status: PublishStatus.PUBLISHED,
        isHomepage: true,
      });

      const result = await service.setHomepage('page-1', false);

      expect(repo.manager.transaction).not.toHaveBeenCalled();
      expect(result.isHomepage).toBe(false);
    });
  });
});
