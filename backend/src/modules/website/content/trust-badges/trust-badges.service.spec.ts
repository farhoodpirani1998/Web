import { TrustBadgesService } from './trust-badges.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

describe('TrustBadgesService', () => {
  let repo: any;
  let siteService: any;
  let ordering: any;
  let publishing: any;
  let media: any;
  let redis: any;
  let service: TrustBadgesService;

  beforeEach(() => {
    repo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: 2 }),
      }),
      create: jest.fn((value) => value),
      save: jest.fn((value) => Promise.resolve({ id: 'badge-1', ...value })),
      find: jest.fn(),
      findOneByOrFail: jest.fn(),
      delete: jest.fn(),
      manager: {},
    };
    siteService = { getDefaultSiteId: jest.fn().mockReturnValue('site-1') };
    ordering = { reorder: jest.fn() };
    publishing = { transition: jest.fn() };
    media = { attach: jest.fn(), detach: jest.fn() };
    redis = { delete: jest.fn() };
    service = new TrustBadgesService(
      repo,
      siteService,
      ordering,
      publishing,
      media,
      redis,
    );
  });

  it('creates a draft at the next position and tracks its media', async () => {
    const result = await service.create({
      name: { fa: 'نشان' },
      imageMediaId: 'media-1',
    });

    expect(result).toMatchObject({
      siteId: 'site-1',
      position: 3,
      status: PublishStatus.DRAFT,
    });
    expect(media.attach).toHaveBeenCalledWith(
      'media-1',
      'trust_badge',
      'badge-1',
    );
    expect(redis.delete).toHaveBeenCalledWith('public-api:trust-badges:list');
  });

  it('updates image media usage only when the reference changes', async () => {
    repo.findOneByOrFail.mockResolvedValue({
      id: 'badge-1',
      imageMediaId: 'media-old',
      name: { fa: 'قديم' },
    });

    await service.update('badge-1', { imageMediaId: 'media-new' });

    expect(media.detach).toHaveBeenCalledWith(
      'media-old',
      'trust_badge',
      'badge-1',
    );
    expect(media.attach).toHaveBeenCalledWith(
      'media-new',
      'trust_badge',
      'badge-1',
    );
  });

  it('reorders the full list and clears the public list cache', async () => {
    await service.reorder(['one', 'two']);
    expect(ordering.reorder).toHaveBeenCalledWith(
      repo.manager,
      'trust_badges',
      ['one', 'two'],
    );
    expect(redis.delete).toHaveBeenCalledWith('public-api:trust-badges:list');
  });
});
