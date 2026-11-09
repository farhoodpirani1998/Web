import { PublicSiteSettingsController } from './public-site-settings.controller';

describe('PublicSiteSettingsController', () => {
  it('returns structured working hours in the cached public settings DTO', async () => {
    const workingHours = [
      {
        day: 'saturday',
        openTime: '08:00',
        closeTime: '16:00',
        isClosed: false,
      },
    ];
    const redis = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
    };
    const controller = new PublicSiteSettingsController(
      { get: jest.fn().mockResolvedValue({
        siteName: { fa: 'نام سایت' },
        socialLinks: [],
        defaultSeo: {},
        featureFlags: {},
        workingHours,
      }) } as never,
      { resolveOne: jest.fn().mockResolvedValue(null) } as never,
      {
        resolveBaseUrl: jest.fn().mockReturnValue('https://example.test'),
        buildOrganizationSchema: jest.fn().mockReturnValue({}),
      } as never,
      {} as never,
      redis as never,
    );

    const result = await controller.get();

    expect(result.workingHours).toEqual(workingHours);
    expect(redis.set).toHaveBeenCalledWith(
      'public-api:site-settings',
      expect.objectContaining({ workingHours }),
      expect.any(Number),
    );
  });
});
