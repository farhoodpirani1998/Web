import { PublicTrustBadgesController } from './public-trust-badges.controller';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

describe('PublicTrustBadgesController', () => {
  it('returns only published, visible rows in the public DTO shape', async () => {
    const row = {
      id: 'badge-1',
      siteId: 'private-site',
      createdAt: new Date(),
      updatedAt: new Date(),
      name: { fa: 'نشان' },
      url: 'https://example.test/verify',
      imageMediaId: 'media-1',
      position: 1,
      status: PublishStatus.PUBLISHED,
    };
    const repo = { find: jest.fn().mockResolvedValue([row]) };
    const redis = { get: jest.fn().mockResolvedValue(null), set: jest.fn() };
    const controller = new PublicTrustBadgesController(
      repo as any,
      { getDefaultSiteId: () => 'site-1' } as any,
      { filterVisible: (items: unknown[]) => items } as any,
      {
        resolveMany: jest.fn().mockResolvedValue(
          new Map([
            [
              'media-1',
              { url: 'https://cdn.test/badge.png', altText: 'نشان' },
            ],
          ]),
        ),
      } as any,
      redis as any,
    );

    const result = await controller.findAll();
    expect(repo.find).toHaveBeenCalledWith({
      where: { siteId: 'site-1', status: PublishStatus.PUBLISHED },
      order: { position: 'ASC' },
    });
    expect(result).toEqual([
      {
        id: 'badge-1',
        name: { fa: 'نشان' },
        url: 'https://example.test/verify',
        image: { url: 'https://cdn.test/badge.png', altText: 'نشان' },
        position: 1,
      },
    ]);
    expect(result[0]).not.toHaveProperty('siteId');
    expect(result[0]).not.toHaveProperty('status');
    expect(redis.set).toHaveBeenCalledWith(
      'public-api:trust-badges:list',
      result,
      60,
    );
  });

  it('suppresses published records whose media reference cannot be resolved', async () => {
    const controller = new PublicTrustBadgesController(
      { find: jest.fn().mockResolvedValue([{
        id: 'badge-1',
        name: { fa: 'نشان' },
        imageMediaId: 'missing',
        status: PublishStatus.PUBLISHED,
      }]) } as any,
      { getDefaultSiteId: () => 'site-1' } as any,
      { filterVisible: (items: unknown[]) => items } as any,
      { resolveMany: jest.fn().mockResolvedValue(new Map()) } as any,
      { get: jest.fn().mockResolvedValue(null), set: jest.fn() } as any,
    );

    await expect(controller.findAll()).resolves.toEqual([]);
  });
});
