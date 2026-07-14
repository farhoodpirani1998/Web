import { HeroService } from './hero.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

describe('HeroService', () => {
  const siteId = 'site-1';
  const authorId = 'user-1';
  let repo: any;
  let siteService: any;
  let ordering: any;
  let publishing: any;
  let media: any;
  let revisions: any;
  let service: HeroService;

  beforeEach(() => {
    repo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: null }),
      }),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'hero-1', ...data })),
      find: jest.fn(),
      findOneByOrFail: jest.fn(),
      delete: jest.fn(),
      manager: {},
    };
    siteService = { getDefaultSiteId: jest.fn().mockReturnValue(siteId) };
    ordering = { reorder: jest.fn() };
    publishing = { transition: jest.fn() };
    media = { attach: jest.fn(), detach: jest.fn() };
    revisions = { record: jest.fn(), list: jest.fn(), getVersion: jest.fn() };
    service = new HeroService(repo, siteService, ordering, publishing, media, revisions);
  });

  describe('create', () => {
    it('records an initial revision and attaches the background media', async () => {
      const slide = await service.create(
        { heading: { fa: 'خوش آمدید' }, backgroundMediaId: 'media-1' },
        authorId,
      );

      expect(media.attach).toHaveBeenCalledWith('media-1', 'hero', 'hero-1');
      expect(revisions.record).toHaveBeenCalledWith(
        'hero',
        'hero-1',
        expect.objectContaining({ heading: { fa: 'خوش آمدید' }, backgroundMediaId: 'media-1' }),
        authorId,
      );
      expect(slide.status).toBe(PublishStatus.DRAFT);
    });
  });

  describe('update', () => {
    it('swaps background media usage and records a new revision', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'hero-1',
        siteId,
        heading: { fa: 'قدیم' },
        backgroundMediaId: 'media-old',
        status: PublishStatus.DRAFT,
      });

      await service.update('hero-1', { backgroundMediaId: 'media-new' }, authorId);

      expect(media.detach).toHaveBeenCalledWith('media-old', 'hero', 'hero-1');
      expect(media.attach).toHaveBeenCalledWith('media-new', 'hero', 'hero-1');
      expect(revisions.record).toHaveBeenCalledWith(
        'hero',
        'hero-1',
        expect.any(Object),
        authorId,
      );
    });
  });

  describe('restoreRevision', () => {
    it('copies the snapshot fields back onto the entity via update()', async () => {
      revisions.getVersion.mockResolvedValue({
        snapshot: {
          heading: { fa: 'نسخه قدیم' },
          subheading: undefined,
          ctaLabel: undefined,
          ctaUrl: undefined,
          backgroundMediaId: 'media-old',
        },
      });
      repo.findOneByOrFail.mockResolvedValue({
        id: 'hero-1',
        siteId,
        heading: { fa: 'نسخه جدید' },
        backgroundMediaId: 'media-new',
        status: PublishStatus.DRAFT,
      });

      const result = await service.restoreRevision('hero-1', 1, authorId);

      expect(revisions.getVersion).toHaveBeenCalledWith('hero', 'hero-1', 1);
      expect(result.heading).toEqual({ fa: 'نسخه قدیم' });
      expect(media.attach).toHaveBeenCalledWith('media-old', 'hero', 'hero-1');
    });
  });

  describe('updateStatus', () => {
    it('delegates transition validation to PublishingService', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'hero-1',
        siteId,
        status: PublishStatus.DRAFT,
      });

      const result = await service.updateStatus('hero-1', PublishStatus.PUBLISHED);

      expect(publishing.transition).toHaveBeenCalledWith({
        from: PublishStatus.DRAFT,
        to: PublishStatus.PUBLISHED,
        entityType: 'hero',
        entityId: 'hero-1',
        siteId,
      });
      expect(result.status).toBe(PublishStatus.PUBLISHED);
    });
  });

  describe('reorder', () => {
    it('delegates to OrderingService against the hero_slides table', async () => {
      await service.reorder(['a', 'b']);
      expect(ordering.reorder).toHaveBeenCalledWith(repo.manager, 'hero_slides', ['a', 'b']);
    });
  });
});
