import { SiteSettingsService } from './site-settings.service';
import { WEBSITE_EVENTS } from '../../core/events/events.constants';

describe('SiteSettingsService', () => {
  const siteId = 'site-1';
  let repo: any;
  let siteService: any;
  let media: any;
  let events: any;
  let service: SiteSettingsService;

  beforeEach(() => {
    repo = {
      findOne: jest.fn(),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'settings-1', ...data })),
      findOneByOrFail: jest.fn(),
    };
    siteService = { getDefaultSiteId: jest.fn().mockReturnValue(siteId) };
    media = { attach: jest.fn(), detach: jest.fn() };
    events = { emit: jest.fn() };
    service = new SiteSettingsService(repo, siteService, media, events);
  });

  describe('onModuleInit', () => {
    it('seeds a row with all feature flags on and an empty social list when none exists', async () => {
      repo.findOne.mockResolvedValue(null);

      await service.onModuleInit();

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          siteId,
          socialLinks: [],
          featureFlags: {
            newsEnabled: true,
            galleryEnabled: true,
            testimonialsEnabled: true,
            faqEnabled: true,
            eventsEnabled: true,
            ctaEnabled: true,
          },
        }),
      );
    });

    it('does not reseed when a row already exists for the site', async () => {
      repo.findOne.mockResolvedValue({ id: 'settings-1', siteId });

      await service.onModuleInit();

      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('updateGeneral', () => {
    it('swaps logo media usage and emits a general SETTINGS_UPDATED event', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'settings-1',
        siteId,
        siteName: { fa: 'قدیم' },
        logoMediaId: 'media-old',
      });

      await service.updateGeneral({ logoMediaId: 'media-new' });

      expect(media.detach).toHaveBeenCalledWith('media-old', 'site_settings', 'settings-1');
      expect(media.attach).toHaveBeenCalledWith('media-new', 'site_settings', 'settings-1');
      expect(events.emit).toHaveBeenCalledWith(
        WEBSITE_EVENTS.SETTINGS_UPDATED,
        { siteId, group: 'general' },
      );
    });

    it('leaves the logo untouched when logoMediaId is not present on the DTO', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'settings-1',
        siteId,
        siteName: { fa: 'نام' },
        logoMediaId: 'media-old',
      });

      await service.updateGeneral({ tagline: { fa: 'شعار جدید' } });

      expect(media.detach).not.toHaveBeenCalled();
      expect(media.attach).not.toHaveBeenCalled();
    });
  });

  describe('updateSeo', () => {
    it('merges partial seo updates rather than overwriting the whole object', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'settings-1',
        siteId,
        defaultSeo: { metaTitle: 'Old Title', noindex: false },
      });

      const result = await service.updateSeo({ metaTitle: 'New Title' });

      expect(result.defaultSeo).toEqual({ metaTitle: 'New Title', noindex: false });
      expect(events.emit).toHaveBeenCalledWith(
        WEBSITE_EVENTS.SETTINGS_UPDATED,
        { siteId, group: 'seo' },
      );
    });
  });

  describe('updateFeatureFlags', () => {
    it('merges partial flag updates rather than overwriting the whole object', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'settings-1',
        siteId,
        featureFlags: {
          newsEnabled: true,
          galleryEnabled: true,
          testimonialsEnabled: true,
          faqEnabled: true,
          eventsEnabled: true,
        },
      });

      const result = await service.updateFeatureFlags({ galleryEnabled: false });

      expect(result.featureFlags).toEqual({
        newsEnabled: true,
        galleryEnabled: false,
        testimonialsEnabled: true,
        faqEnabled: true,
        eventsEnabled: true,
      });
      expect(events.emit).toHaveBeenCalledWith(
        WEBSITE_EVENTS.SETTINGS_UPDATED,
        { siteId, group: 'feature_flags' },
      );
    });
  });
});
