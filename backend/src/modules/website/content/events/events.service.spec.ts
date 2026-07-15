import { BadRequestException, ConflictException } from '@nestjs/common';
import { EventsService } from './events.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

describe('EventsService', () => {
  const siteId = 'site-1';
  let repo: any;
  let siteService: any;
  let publishing: any;
  let media: any;
  let sitemap: any;
  let siteSettings: any;
  let revisions: any;
  let service: EventsService;

  beforeEach(() => {
    repo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'event-1', ...data })),
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
    siteSettings = {
      get: jest.fn().mockResolvedValue({ featureFlags: { eventsEnabled: true } }),
    };
    revisions = {
      record: jest.fn(),
      list: jest.fn(),
      getVersion: jest.fn(),
    };
    service = new EventsService(
      repo,
      siteService,
      publishing,
      media,
      sitemap,
      siteSettings,
      revisions,
    );
  });

  describe('onModuleInit', () => {
    it('registers a sitemap provider', () => {
      service.onModuleInit();
      expect(sitemap.register).toHaveBeenCalledWith(expect.any(Function));
    });

    it('returns no entries when eventsEnabled is off', async () => {
      siteSettings.get.mockResolvedValue({ featureFlags: { eventsEnabled: false } });

      service.onModuleInit();
      const provider = sitemap.register.mock.calls[0][0];
      const entries = await provider();

      expect(entries).toEqual([]);
    });

    it('withholds a published event whose publishAt is still in the future', async () => {
      const future = new Date(Date.now() + 86_400_000);
      jest.spyOn(service, 'findAll').mockResolvedValue([
        {
          id: 'e1',
          slug: 'future-event',
          publishAt: future,
          updatedAt: new Date(),
        } as any,
      ]);

      service.onModuleInit();
      const provider = sitemap.register.mock.calls[0][0];
      const entries = await provider();

      expect(entries).toEqual([]);
    });

    it('includes a published event once publishAt has passed', async () => {
      const past = new Date(Date.now() - 86_400_000);
      jest.spyOn(service, 'findAll').mockResolvedValue([
        { id: 'e1', slug: 'past-event', publishAt: past, updatedAt: past } as any,
      ]);

      service.onModuleInit();
      const provider = sitemap.register.mock.calls[0][0];
      const entries = await provider();

      expect(entries).toEqual([{ loc: '/events/past-event', lastmod: past }]);
    });
  });

  describe('create', () => {
    it('creates an event as DRAFT and attaches the featured image', async () => {
      const event = await service.create(
        {
          title: { fa: 'رویداد' },
          slug: 'open-house',
          body: { fa: 'توضیحات' },
          startAt: '2027-01-01T10:00:00.000Z',
          featuredImageMediaId: 'media-1',
        },
        'author-1',
      );

      expect(event.status).toBe(PublishStatus.DRAFT);
      expect(event.siteId).toBe(siteId);
      expect(event.allDay).toBe(false);
      expect(media.attach).toHaveBeenCalledWith('media-1', 'calendar_event', 'event-1');
      expect(revisions.record).toHaveBeenCalledWith(
        'calendar_event',
        'event-1',
        expect.objectContaining({ slug: 'open-house' }),
        'author-1',
      );
    });

    it('rejects a slug already used on this site', async () => {
      repo.findOne.mockResolvedValue({ id: 'other-event' });

      await expect(
        service.create(
          {
            title: { fa: 'رویداد' },
            slug: 'taken-slug',
            body: { fa: 'توضیحات' },
            startAt: '2027-01-01T10:00:00.000Z',
          },
          'author-1',
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects an endAt before startAt', async () => {
      await expect(
        service.create(
          {
            title: { fa: 'رویداد' },
            slug: 'bad-range',
            body: { fa: 'توضیحات' },
            startAt: '2027-01-02T10:00:00.000Z',
            endAt: '2027-01-01T10:00:00.000Z',
          },
          'author-1',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('update', () => {
    it('re-checks slug uniqueness only when the slug actually changes', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'event-1',
        siteId,
        slug: 'old-slug',
        startAt: new Date('2027-01-01T10:00:00.000Z'),
        status: PublishStatus.DRAFT,
      });

      await service.update('event-1', { category: 'fundraiser' }, 'author-1');

      expect(repo.findOne).not.toHaveBeenCalled();
    });

    it('rejects renaming to a slug already used by another event', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'event-1',
        siteId,
        slug: 'old-slug',
        startAt: new Date('2027-01-01T10:00:00.000Z'),
        status: PublishStatus.DRAFT,
      });
      repo.findOne.mockResolvedValue({ id: 'other-event' });

      await expect(
        service.update('event-1', { slug: 'taken-slug' }, 'author-1'),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('detaches the old featured image and attaches the new one when it changes', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'event-1',
        siteId,
        slug: 'old-slug',
        startAt: new Date('2027-01-01T10:00:00.000Z'),
        featuredImageMediaId: 'media-old',
        status: PublishStatus.DRAFT,
      });

      await service.update('event-1', { featuredImageMediaId: 'media-new' }, 'author-1');

      expect(media.detach).toHaveBeenCalledWith('media-old', 'calendar_event', 'event-1');
      expect(media.attach).toHaveBeenCalledWith('media-new', 'calendar_event', 'event-1');
    });

    it('rejects moving endAt before the existing startAt', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'event-1',
        siteId,
        slug: 'old-slug',
        startAt: new Date('2027-01-02T10:00:00.000Z'),
        status: PublishStatus.DRAFT,
      });

      await expect(
        service.update('event-1', { endAt: '2027-01-01T10:00:00.000Z' }, 'author-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('remove', () => {
    it('detaches the featured image before deleting', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'event-1',
        siteId,
        featuredImageMediaId: 'media-1',
      });

      await service.remove('event-1');

      expect(media.detach).toHaveBeenCalledWith('media-1', 'calendar_event', 'event-1');
      expect(repo.delete).toHaveBeenCalledWith({ id: 'event-1' });
    });
  });

  describe('updateStatus', () => {
    it('delegates transition validation to PublishingService', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'event-1',
        siteId,
        status: PublishStatus.DRAFT,
      });

      const result = await service.updateStatus('event-1', PublishStatus.PUBLISHED);

      expect(publishing.transition).toHaveBeenCalledWith({
        from: PublishStatus.DRAFT,
        to: PublishStatus.PUBLISHED,
        entityType: 'calendar_event',
        entityId: 'event-1',
        siteId,
      });
      expect(result.status).toBe(PublishStatus.PUBLISHED);
    });
  });

  describe('schedule', () => {
    it('sets a future publishAt', async () => {
      repo.findOneByOrFail.mockResolvedValue({ id: 'event-1', siteId });

      const isoDate = '2027-01-01T00:00:00.000Z';
      const result = await service.schedule('event-1', isoDate);

      expect(result.publishAt).toEqual(new Date(isoDate));
    });

    it('clears the schedule when publishAt is null', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'event-1',
        siteId,
        publishAt: new Date(),
      });

      const result = await service.schedule('event-1', null);

      expect(result.publishAt).toBeUndefined();
    });
  });
});
