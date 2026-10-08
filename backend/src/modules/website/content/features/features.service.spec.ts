import { FeaturesService } from './features.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

describe('FeaturesService', () => {
  const siteId = 'site-1';
  let repo: any;
  let siteService: any;
  let ordering: any;
  let publishing: any;
  let service: FeaturesService;

  beforeEach(() => {
    repo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: null }),
      }),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'feature-1', ...data })),
      find: jest.fn(),
      findOneByOrFail: jest.fn(),
      delete: jest.fn(),
      manager: {},
    };
    siteService = { getDefaultSiteId: jest.fn().mockReturnValue(siteId) };
    ordering = { reorder: jest.fn() };
    publishing = { transition: jest.fn() };
    service = new FeaturesService(repo, siteService, ordering, publishing);
  });

  describe('create', () => {
    it('creates a feature as DRAFT with position 0 when none exist yet', async () => {
      const feature = await service.create({
        title: { fa: 'برنامه دوزبانه' },
        description: { fa: 'توضیحات' },
        icon: 'graduation-cap',
      });

      expect(feature.status).toBe(PublishStatus.DRAFT);
      expect(feature.position).toBe(0);
      expect(feature.siteId).toBe(siteId);
    });

    it('places the new feature after the current max position', async () => {
      repo.createQueryBuilder().getRawOne.mockResolvedValue({ max: 3 });
      const feature = await service.create({
        title: { fa: 'عنوان' },
        description: { fa: 'توضیحات' },
      });
      expect(feature.position).toBe(4);
    });
  });

  describe('findAll', () => {
    it('scopes to the default site and orders by position', async () => {
      await service.findAll();
      expect(repo.find).toHaveBeenCalledWith({
        where: { siteId },
        order: { position: 'ASC' },
      });
    });

    it('filters by status when provided', async () => {
      await service.findAll(PublishStatus.PUBLISHED);
      expect(repo.find).toHaveBeenCalledWith({
        where: { siteId, status: PublishStatus.PUBLISHED },
        order: { position: 'ASC' },
      });
    });
  });

  describe('update', () => {
    it('only overwrites fields present on the DTO', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'feature-1',
        siteId,
        title: { fa: 'قدیمی' },
        description: { fa: 'قدیمی' },
        icon: 'old-icon',
        status: PublishStatus.DRAFT,
      });

      const updated = await service.update('feature-1', { icon: 'new-icon' });

      expect(updated.icon).toBe('new-icon');
      expect(updated.title).toEqual({ fa: 'قدیمی' });
    });
  });

  describe('updateStatus', () => {
    it('delegates transition validation to PublishingService', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'feature-1',
        siteId,
        status: PublishStatus.DRAFT,
      });

      const result = await service.updateStatus('feature-1', PublishStatus.PUBLISHED);

      expect(publishing.transition).toHaveBeenCalledWith({
        from: PublishStatus.DRAFT,
        to: PublishStatus.PUBLISHED,
        entityType: 'feature',
        entityId: 'feature-1',
        siteId,
      });
      expect(result.status).toBe(PublishStatus.PUBLISHED);
    });
  });

  describe('reorder', () => {
    it('delegates to OrderingService with the features table name', async () => {
      await service.reorder(['a', 'b', 'c']);
      expect(ordering.reorder).toHaveBeenCalledWith(repo.manager, 'features', [
        'a',
        'b',
        'c',
      ]);
    });
  });
});
