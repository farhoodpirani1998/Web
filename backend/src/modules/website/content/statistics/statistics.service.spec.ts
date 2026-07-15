import { StatisticsService } from './statistics.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

describe('StatisticsService', () => {
  const siteId = 'site-1';
  let repo: any;
  let siteService: any;
  let ordering: any;
  let publishing: any;
  let service: StatisticsService;

  beforeEach(() => {
    repo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: null }),
      }),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'statistic-1', ...data })),
      find: jest.fn(),
      findOneByOrFail: jest.fn(),
      delete: jest.fn(),
      manager: {},
    };
    siteService = { getDefaultSiteId: jest.fn().mockReturnValue(siteId) };
    ordering = { reorder: jest.fn() };
    publishing = { transition: jest.fn() };
    service = new StatisticsService(repo, siteService, ordering, publishing);
  });

  describe('create', () => {
    it('creates a statistic as DRAFT with position 0 when none exist yet', async () => {
      const statistic = await service.create({
        label: { fa: 'فارغ‌التحصیلان' },
        value: 500,
        suffix: '+',
        icon: 'graduation-cap',
      });

      expect(statistic.status).toBe(PublishStatus.DRAFT);
      expect(statistic.position).toBe(0);
      expect(statistic.siteId).toBe(siteId);
      expect(statistic.value).toBe(500);
      expect(statistic.suffix).toBe('+');
    });

    it('places the new statistic after the current max position', async () => {
      repo.createQueryBuilder().getRawOne.mockResolvedValue({ max: 3 });
      const statistic = await service.create({
        label: { fa: 'سال سابقه' },
        value: 20,
      });
      expect(statistic.position).toBe(4);
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
        id: 'statistic-1',
        siteId,
        label: { fa: 'قدیمی' },
        value: 100,
        suffix: '+',
        icon: 'old-icon',
        status: PublishStatus.DRAFT,
      });

      const updated = await service.update('statistic-1', { value: 200 });

      expect(updated.value).toBe(200);
      expect(updated.label).toEqual({ fa: 'قدیمی' });
      expect(updated.suffix).toBe('+');
    });

    it('clears suffix/icon when explicitly set to null', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'statistic-1',
        siteId,
        suffix: '+',
        icon: 'old-icon',
        status: PublishStatus.DRAFT,
      });

      const result = await service.update('statistic-1', { suffix: null, icon: null });

      expect(result.suffix).toBeUndefined();
      expect(result.icon).toBeUndefined();
    });
  });

  describe('updateStatus', () => {
    it('delegates transition validation to PublishingService', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'statistic-1',
        siteId,
        status: PublishStatus.DRAFT,
      });

      const result = await service.updateStatus('statistic-1', PublishStatus.PUBLISHED);

      expect(publishing.transition).toHaveBeenCalledWith({
        from: PublishStatus.DRAFT,
        to: PublishStatus.PUBLISHED,
        entityType: 'statistic',
        entityId: 'statistic-1',
        siteId,
      });
      expect(result.status).toBe(PublishStatus.PUBLISHED);
    });
  });

  describe('reorder', () => {
    it('delegates to OrderingService with the statistics table name', async () => {
      await service.reorder(['a', 'b', 'c']);
      expect(ordering.reorder).toHaveBeenCalledWith(repo.manager, 'statistics', [
        'a',
        'b',
        'c',
      ]);
    });
  });
});
