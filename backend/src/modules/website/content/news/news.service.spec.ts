import { ConflictException } from '@nestjs/common';
import { NewsService } from './news.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

describe('NewsService', () => {
  const siteId = 'site-1';
  let repo: any;
  let siteService: any;
  let publishing: any;
  let media: any;
  let sitemap: any;
  let revisions: any;
  let service: NewsService;

  beforeEach(() => {
    repo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'article-1', ...data })),
      findOneByOrFail: jest.fn(),
      delete: jest.fn(),
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
    service = new NewsService(repo, siteService, publishing, media, sitemap, revisions);
  });

  describe('onModuleInit', () => {
    it('registers a sitemap provider', () => {
      service.onModuleInit();
      expect(sitemap.register).toHaveBeenCalledWith(expect.any(Function));
    });

    it('withholds a published article whose publishAt is still in the future', async () => {
      const future = new Date(Date.now() + 86_400_000);
      jest
        .spyOn(service, 'findAll')
        .mockResolvedValue([
          {
            id: 'a1',
            slug: 'future-article',
            publishAt: future,
            updatedAt: new Date(),
          } as any,
        ]);

      service.onModuleInit();
      const provider = sitemap.register.mock.calls[0][0];
      const entries = await provider();

      expect(entries).toEqual([]);
    });

    it('includes a published article once publishAt has passed', async () => {
      const past = new Date(Date.now() - 86_400_000);
      jest.spyOn(service, 'findAll').mockResolvedValue([
        { id: 'a1', slug: 'past-article', publishAt: past, updatedAt: past } as any,
      ]);

      service.onModuleInit();
      const provider = sitemap.register.mock.calls[0][0];
      const entries = await provider();

      expect(entries).toEqual([{ loc: '/news/past-article', lastmod: past }]);
    });

    it('includes a published article with no schedule at all', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([
        { id: 'a1', slug: 'evergreen', publishAt: undefined, updatedAt: new Date() } as any,
      ]);

      service.onModuleInit();
      const provider = sitemap.register.mock.calls[0][0];
      const entries = await provider();

      expect(entries).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('creates an article as DRAFT and attaches the featured image', async () => {
      const article = await service.create(
        {
          title: { fa: 'عنوان خبر' },
          slug: 'news-title',
          body: { fa: 'متن خبر' },
          featuredImageMediaId: 'media-1',
        },
        'author-1',
      );

      expect(article.status).toBe(PublishStatus.DRAFT);
      expect(article.siteId).toBe(siteId);
      expect(media.attach).toHaveBeenCalledWith('media-1', 'news_article', 'article-1');
      expect(revisions.record).toHaveBeenCalledWith(
        'news_article',
        'article-1',
        expect.objectContaining({ slug: 'news-title' }),
        'author-1',
      );
    });

    it('rejects a slug already used on this site', async () => {
      repo.findOne.mockResolvedValue({ id: 'other-article' });

      await expect(
        service.create(
          { title: { fa: 'عنوان' }, slug: 'taken-slug', body: { fa: 'متن' } },
          'author-1',
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('update', () => {
    it('re-checks slug uniqueness only when the slug actually changes', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'article-1',
        siteId,
        slug: 'old-slug',
        title: { fa: 'قدیمی' },
        status: PublishStatus.DRAFT,
      });

      await service.update('article-1', { category: 'events' }, 'author-1');

      expect(repo.findOne).not.toHaveBeenCalled();
    });

    it('rejects renaming to a slug already used by another article', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'article-1',
        siteId,
        slug: 'old-slug',
        status: PublishStatus.DRAFT,
      });
      repo.findOne.mockResolvedValue({ id: 'other-article' });

      await expect(
        service.update('article-1', { slug: 'taken-slug' }, 'author-1'),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('detaches the old featured image and attaches the new one when it changes', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'article-1',
        siteId,
        slug: 'old-slug',
        featuredImageMediaId: 'media-old',
        status: PublishStatus.DRAFT,
      });

      await service.update('article-1', { featuredImageMediaId: 'media-new' }, 'author-1');

      expect(media.detach).toHaveBeenCalledWith('media-old', 'news_article', 'article-1');
      expect(media.attach).toHaveBeenCalledWith('media-new', 'news_article', 'article-1');
    });
  });

  describe('remove', () => {
    it('detaches the featured image before deleting', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'article-1',
        siteId,
        featuredImageMediaId: 'media-1',
      });

      await service.remove('article-1');

      expect(media.detach).toHaveBeenCalledWith('media-1', 'news_article', 'article-1');
      expect(repo.delete).toHaveBeenCalledWith({ id: 'article-1' });
    });
  });

  describe('updateStatus', () => {
    it('delegates transition validation to PublishingService', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'article-1',
        siteId,
        status: PublishStatus.DRAFT,
      });

      const result = await service.updateStatus('article-1', PublishStatus.PUBLISHED);

      expect(publishing.transition).toHaveBeenCalledWith({
        from: PublishStatus.DRAFT,
        to: PublishStatus.PUBLISHED,
        entityType: 'news_article',
        entityId: 'article-1',
        siteId,
      });
      expect(result.status).toBe(PublishStatus.PUBLISHED);
    });
  });

  describe('schedule', () => {
    it('sets a future publishAt', async () => {
      repo.findOneByOrFail.mockResolvedValue({ id: 'article-1', siteId });

      const isoDate = '2027-01-01T00:00:00.000Z';
      const result = await service.schedule('article-1', isoDate);

      expect(result.publishAt).toEqual(new Date(isoDate));
    });

    it('clears the schedule when publishAt is null', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'article-1',
        siteId,
        publishAt: new Date(),
      });

      const result = await service.schedule('article-1', null);

      expect(result.publishAt).toBeUndefined();
    });
  });
});
