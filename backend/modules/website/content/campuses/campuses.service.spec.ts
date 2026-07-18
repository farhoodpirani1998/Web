import { ConflictException } from '@nestjs/common';
import { CampusesService } from './campuses.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

describe('CampusesService', () => {
  const siteId = 'site-1';
  let repo: any;
  let siteService: any;
  let ordering: any;
  let publishing: any;
  let media: any;
  let sitemap: any;
  let revisions: any;
  let redis: any;
  let service: CampusesService;

  beforeEach(() => {
    repo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'campus-1', ...data })),
      findOneByOrFail: jest.fn(),
      delete: jest.fn(),
      manager: {},
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getRawOne: jest.fn().mockResolvedValue({ max: null }),
      }),
    };
    siteService = { getDefaultSiteId: jest.fn().mockReturnValue(siteId) };
    ordering = { reorder: jest.fn() };
    publishing = { transition: jest.fn() };
    media = { attach: jest.fn(), detach: jest.fn() };
    sitemap = { register: jest.fn() };
    revisions = {
      record: jest.fn(),
      list: jest.fn(),
      getVersion: jest.fn(),
    };
    redis = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
      delete: jest.fn(),
      deleteByPrefix: jest.fn(),
    };
    service = new CampusesService(
      repo,
      siteService,
      ordering,
      publishing,
      media,
      sitemap,
      revisions,
      redis,
    );
  });

  describe('onModuleInit', () => {
    it('registers a sitemap provider', () => {
      service.onModuleInit();
      expect(sitemap.register).toHaveBeenCalledWith(expect.any(Function));
    });

    it('withholds a published campus whose publishAt is still in the future', async () => {
      const future = new Date(Date.now() + 86_400_000);
      jest.spyOn(service, 'findAll').mockResolvedValue([
        {
          id: 'c1',
          slug: 'future-campus',
          publishAt: future,
          updatedAt: new Date(),
        } as any,
      ]);

      service.onModuleInit();
      const provider = sitemap.register.mock.calls[0][0];
      const entries = await provider();

      expect(entries).toEqual([]);
    });

    it('includes a published campus once publishAt has passed', async () => {
      const past = new Date(Date.now() - 86_400_000);
      jest.spyOn(service, 'findAll').mockResolvedValue([
        { id: 'c1', slug: 'past-campus', publishAt: past, updatedAt: past } as any,
      ]);

      service.onModuleInit();
      const provider = sitemap.register.mock.calls[0][0];
      const entries = await provider();

      expect(entries).toEqual([{ loc: '/campuses/past-campus', lastmod: past }]);
    });
  });

  describe('create', () => {
    it('creates a campus as DRAFT, appends it to the end of the order, and attaches the featured image', async () => {
      repo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: 2 }),
      });

      const campus = await service.create(
        {
          title: { fa: 'پردیس' },
          slug: 'downtown-campus',
          body: { fa: 'توضیحات' },
          featuredImageMediaId: 'media-1',
        },
        'author-1',
      );

      expect(campus.status).toBe(PublishStatus.DRAFT);
      expect(campus.siteId).toBe(siteId);
      expect(campus.position).toBe(3);
      expect(media.attach).toHaveBeenCalledWith('media-1', 'campus', 'campus-1');
      expect(revisions.record).toHaveBeenCalledWith(
        'campus',
        'campus-1',
        expect.objectContaining({ slug: 'downtown-campus' }),
        'author-1',
      );
    });

    it('defaults position to 0 for the first campus on a site', async () => {
      const campus = await service.create(
        {
          title: { fa: 'پردیس' },
          slug: 'first-campus',
          body: { fa: 'توضیحات' },
        },
        'author-1',
      );

      expect(campus.position).toBe(0);
    });

    it('rejects a slug already used on this site', async () => {
      repo.findOne.mockResolvedValue({ id: 'other-campus' });

      await expect(
        service.create(
          {
            title: { fa: 'پردیس' },
            slug: 'taken-slug',
            body: { fa: 'توضیحات' },
          },
          'author-1',
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('update', () => {
    it('re-checks slug uniqueness only when the slug actually changes', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'campus-1',
        siteId,
        slug: 'old-slug',
        status: PublishStatus.DRAFT,
      });

      await service.update('campus-1', { phone: '555-0100' }, 'author-1');

      expect(repo.findOne).not.toHaveBeenCalled();
    });

    it('rejects renaming to a slug already used by another campus', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'campus-1',
        siteId,
        slug: 'old-slug',
        status: PublishStatus.DRAFT,
      });
      repo.findOne.mockResolvedValue({ id: 'other-campus' });

      await expect(
        service.update('campus-1', { slug: 'taken-slug' }, 'author-1'),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('detaches the old featured image and attaches the new one when it changes', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'campus-1',
        siteId,
        slug: 'old-slug',
        featuredImageMediaId: 'media-old',
        status: PublishStatus.DRAFT,
      });

      await service.update('campus-1', { featuredImageMediaId: 'media-new' }, 'author-1');

      expect(media.detach).toHaveBeenCalledWith('media-old', 'campus', 'campus-1');
      expect(media.attach).toHaveBeenCalledWith('media-new', 'campus', 'campus-1');
    });

    it('clears mapUrl/phone/email when explicitly set to null', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'campus-1',
        siteId,
        slug: 'old-slug',
        mapUrl: 'https://maps.example.com/old',
        phone: '555-0100',
        email: 'old@example.com',
        status: PublishStatus.DRAFT,
      });

      const result = await service.update(
        'campus-1',
        { mapUrl: null, phone: null, email: null },
        'author-1',
      );

      expect(result.mapUrl).toBeUndefined();
      expect(result.phone).toBeUndefined();
      expect(result.email).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('detaches the featured image before deleting', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'campus-1',
        siteId,
        featuredImageMediaId: 'media-1',
      });

      await service.remove('campus-1');

      expect(media.detach).toHaveBeenCalledWith('media-1', 'campus', 'campus-1');
      expect(repo.delete).toHaveBeenCalledWith({ id: 'campus-1' });
    });
  });

  describe('updateStatus', () => {
    it('delegates transition validation to PublishingService', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'campus-1',
        siteId,
        status: PublishStatus.DRAFT,
      });

      const result = await service.updateStatus('campus-1', PublishStatus.PUBLISHED);

      expect(publishing.transition).toHaveBeenCalledWith({
        from: PublishStatus.DRAFT,
        to: PublishStatus.PUBLISHED,
        entityType: 'campus',
        entityId: 'campus-1',
        siteId,
      });
      expect(result.status).toBe(PublishStatus.PUBLISHED);
    });
  });

  describe('schedule', () => {
    it('sets a future publishAt', async () => {
      repo.findOneByOrFail.mockResolvedValue({ id: 'campus-1', siteId });

      const isoDate = '2027-01-01T00:00:00.000Z';
      const result = await service.schedule('campus-1', isoDate);

      expect(result.publishAt).toEqual(new Date(isoDate));
    });

    it('clears the schedule when publishAt is null', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'campus-1',
        siteId,
        publishAt: new Date(),
      });

      const result = await service.schedule('campus-1', null);

      expect(result.publishAt).toBeUndefined();
    });
  });

  describe('reorder', () => {
    it('delegates to OrderingService against the campuses table', async () => {
      await service.reorder(['c1', 'c2', 'c3']);

      expect(ordering.reorder).toHaveBeenCalledWith(
        repo.manager,
        'campuses',
        ['c1', 'c2', 'c3'],
      );
    });
  });
});
