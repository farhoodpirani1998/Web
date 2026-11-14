import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { PublicVisibilityService } from '../common/public-visibility.service';
import { PublicCampusesController } from './public-campuses.controller';

describe('PublicCampusesController', () => {
  it('returns coordinates only for currently published campuses', async () => {
    const published = {
      id: 'published-campus',
      siteId: 'site-id',
      status: PublishStatus.PUBLISHED,
      title: { fa: 'مدرسه منتشرشده' },
      slug: 'published-campus',
      latitude: 35.731,
      longitude: 50.989,
      position: 0,
    };
    const scheduled = {
      ...published,
      id: 'scheduled-campus',
      status: PublishStatus.PUBLISHED,
      publishAt: new Date('2999-01-01T00:00:00.000Z'),
      latitude: 35.732,
      longitude: 50.99,
    };
    const draft = {
      ...published,
      id: 'draft-campus',
      status: PublishStatus.DRAFT,
      latitude: 35.733,
      longitude: 50.991,
    };
    const campusesRepo = {
      find: jest.fn().mockResolvedValue([published, scheduled, draft]),
    };
    const redis = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
    };
    const controller = new PublicCampusesController(
      campusesRepo as never,
      { getDefaultSiteId: jest.fn().mockReturnValue('site-id') } as never,
      new PublicVisibilityService(),
      { resolveMany: jest.fn().mockResolvedValue(new Map()) } as never,
      {} as never,
      {} as never,
      redis as never,
    );

    const result = await controller.findAll();

    expect(campusesRepo.find).toHaveBeenCalledWith({
      where: { siteId: 'site-id', status: PublishStatus.PUBLISHED },
      order: { position: 'ASC' },
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'published-campus',
      latitude: 35.731,
      longitude: 50.989,
    });
    expect(redis.set).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining([expect.objectContaining({ latitude: 35.731 })]),
      expect.any(Number),
    );
  });
});
