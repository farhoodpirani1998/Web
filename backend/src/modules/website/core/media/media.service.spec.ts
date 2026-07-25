import { MediaService } from './media.service';
import { MediaStatus } from './entities/media.entity';

describe('MediaService', () => {
  const siteId = 'site-1';
  let mediaRepo: any;
  let usageRepo: any;
  let storage: any;
  let siteService: any;
  let events: any;
  let service: MediaService;

  beforeEach(() => {
    mediaRepo = {
      find: jest.fn(),
      findOneByOrFail: jest.fn(),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'media-1', ...data })),
      update: jest.fn(),
      delete: jest.fn(),
    };
    usageRepo = {
      find: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    storage = { upload: jest.fn(), delete: jest.fn() };
    siteService = { getDefaultSiteId: jest.fn().mockReturnValue(siteId) };
    events = { emit: jest.fn() };
    service = new MediaService(mediaRepo, usageRepo, storage, siteService, events);
  });

  describe('findAll', () => {
    it('returns an empty list without querying usage counts', async () => {
      mediaRepo.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(usageRepo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('merges each media row with its usage count, defaulting absent rows to zero', async () => {
      mediaRepo.find.mockResolvedValue([
        { id: 'media-1', status: MediaStatus.ACTIVE },
        { id: 'media-2', status: MediaStatus.ACTIVE },
      ]);
      const qb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([{ mediaId: 'media-1', count: '3' }]),
      };
      usageRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll();

      expect(qb.where).toHaveBeenCalledWith('usage.mediaId IN (:...mediaIds)', {
        mediaIds: ['media-1', 'media-2'],
      });
      expect(result).toEqual([
        { id: 'media-1', status: MediaStatus.ACTIVE, usageCount: 3 },
        { id: 'media-2', status: MediaStatus.ACTIVE, usageCount: 0 },
      ]);
    });
  });

  describe('getUsage', () => {
    it('404s (via findOneByOrFail) instead of returning an empty list for a bad id', async () => {
      mediaRepo.findOneByOrFail.mockRejectedValue(new Error('not found'));

      await expect(service.getUsage('missing')).rejects.toThrow('not found');
      expect(usageRepo.find).not.toHaveBeenCalled();
    });

    it('returns the usage rows for a real media id, newest first', async () => {
      mediaRepo.findOneByOrFail.mockResolvedValue({ id: 'media-1' });
      const rows = [{ id: 'usage-2' }, { id: 'usage-1' }];
      usageRepo.find.mockResolvedValue(rows);

      const result = await service.getUsage('media-1');

      expect(usageRepo.find).toHaveBeenCalledWith({
        where: { mediaId: 'media-1' },
        order: { createdAt: 'DESC' },
      });
      expect(result).toBe(rows);
    });
  });
});
