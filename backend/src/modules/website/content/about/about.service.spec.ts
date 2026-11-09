import { AboutService } from './about.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

describe('AboutService', () => {
  const siteId = 'site-1';
  const authorId = 'user-1';
  let repo: any;
  let siteService: any;
  let publishing: any;
  let media: any;
  let sitemap: any;
  let revisions: any;
  let redis: any;
  let service: AboutService;

  beforeEach(() => {
    repo = {
      findOne: jest.fn(),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'about-1', ...data })),
      findOneByOrFail: jest.fn(),
    };
    siteService = { getDefaultSiteId: jest.fn().mockReturnValue(siteId) };
    publishing = { transition: jest.fn() };
    media = { attach: jest.fn(), detach: jest.fn() };
    sitemap = { register: jest.fn() };
    revisions = { record: jest.fn(), list: jest.fn(), getVersion: jest.fn() };
    redis = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      deleteByPrefix: jest.fn(),
    };
    service = new AboutService(
      repo,
      siteService,
      publishing,
      media,
      sitemap,
      revisions,
      redis,
    );
  });

  describe('onModuleInit', () => {
    it('seeds an empty draft row when none exists for the site', async () => {
      repo.findOne.mockResolvedValue(null);

      await service.onModuleInit();

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ siteId, status: PublishStatus.DRAFT }),
      );
      expect(sitemap.register).toHaveBeenCalledTimes(1);
    });

    it('does not reseed when a row already exists for the site', async () => {
      repo.findOne.mockResolvedValue({ id: 'about-1', siteId });

      await service.onModuleInit();

      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('swaps image media usage and records a new revision', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'about-1',
        siteId,
        title: { fa: 'قدیم' },
        body: { fa: 'متن' },
        seo: {},
        imageMediaId: 'media-old',
        status: PublishStatus.DRAFT,
      });

      await service.update({ imageMediaId: 'media-new' }, authorId);

      expect(media.detach).toHaveBeenCalledWith(
        'media-old',
        'about',
        'about-1',
      );
      expect(media.attach).toHaveBeenCalledWith(
        'media-new',
        'about',
        'about-1',
      );
      expect(revisions.record).toHaveBeenCalledWith(
        'about',
        'about-1',
        expect.any(Object),
        authorId,
      );
    });

    it('merges partial seo updates rather than overwriting the whole object', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'about-1',
        siteId,
        title: { fa: 't' },
        body: { fa: 'b' },
        seo: { metaTitle: 'Old Title', noindex: false },
        status: PublishStatus.DRAFT,
      });

      const result = await service.update(
        { seo: { metaTitle: 'New Title' } },
        authorId,
      );

      expect(result.seo).toEqual({ metaTitle: 'New Title', noindex: false });
    });

    it('replaces section content and synchronizes team image usages', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'about-1',
        siteId,
        title: { fa: 'عنوان' },
        body: { fa: 'متن' },
        seo: {},
        imageMediaId: 'cover-image',
        sections: {
          stats: { items: [] },
          team: {
            items: [
              {
                id: 'member-old',
                name: { fa: 'نام قبلی' },
                role: { fa: 'سمت قبلی' },
                avatarMediaId: 'team-image-old',
              },
            ],
          },
        },
        status: PublishStatus.DRAFT,
      });

      const sections = {
        stats: { items: [] },
        team: {
          items: [
            {
              id: 'member-new',
              name: { fa: 'نام جدید' },
              role: { fa: 'سمت جدید' },
              avatarMediaId: 'team-image-new',
            },
          ],
        },
      };

      const result = await service.update({ sections }, authorId);

      expect(result.sections).toEqual(sections);
      expect(media.detach).toHaveBeenCalledWith(
        'team-image-old',
        'about',
        'about-1',
      );
      expect(media.attach).toHaveBeenCalledWith(
        'team-image-new',
        'about',
        'about-1',
      );
      expect(media.detach).not.toHaveBeenCalledWith(
        'cover-image',
        'about',
        'about-1',
      );
      expect(media.attach).not.toHaveBeenCalledWith(
        'cover-image',
        'about',
        'about-1',
      );
      expect(revisions.record).toHaveBeenCalledWith(
        'about',
        'about-1',
        expect.objectContaining({ sections }),
        authorId,
      );
    });
  });

  describe('updateStatus', () => {
    it('delegates transition validation to PublishingService', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'about-1',
        siteId,
        status: PublishStatus.DRAFT,
      });

      const result = await service.updateStatus(PublishStatus.PUBLISHED);

      expect(publishing.transition).toHaveBeenCalledWith({
        from: PublishStatus.DRAFT,
        to: PublishStatus.PUBLISHED,
        entityType: 'about',
        entityId: 'about-1',
        siteId,
      });
      expect(result.status).toBe(PublishStatus.PUBLISHED);
    });

    describe('restoreRevision', () => {
      it('clears About sections when restoring a revision created before sections existed', async () => {
        repo.findOneByOrFail.mockResolvedValue({
          id: 'about-1',
          siteId,
          title: { fa: 'عنوان فعلی' },
          body: { fa: 'متن فعلی' },
          imageMediaId: undefined,
          sections: { stats: { items: [] } },
          seo: {},
          status: PublishStatus.DRAFT,
        });
        revisions.getVersion.mockResolvedValue({
          snapshot: {
            title: { fa: 'عنوان قبلی' },
            body: { fa: 'متن قبلی' },
          },
        });

        const result = await service.restoreRevision(1, authorId);

        expect(result.sections).toEqual({});
      });
    });
  });
});
