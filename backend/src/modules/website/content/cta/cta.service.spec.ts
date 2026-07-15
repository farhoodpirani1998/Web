import { CtaService } from './cta.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

describe('CtaService', () => {
  const siteId = 'site-1';
  let repo: any;
  let siteService: any;
  let publishing: any;
  let media: any;
  let service: CtaService;

  beforeEach(() => {
    repo = {
      findOne: jest.fn(),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'cta-1', ...data })),
      findOneByOrFail: jest.fn(),
    };
    siteService = { getDefaultSiteId: jest.fn().mockReturnValue(siteId) };
    publishing = { transition: jest.fn() };
    media = { attach: jest.fn(), detach: jest.fn() };
    service = new CtaService(repo, siteService, publishing, media);
  });

  describe('onModuleInit', () => {
    it('seeds an empty draft row when none exists for the site', async () => {
      repo.findOne.mockResolvedValue(null);

      await service.onModuleInit();

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ siteId, status: PublishStatus.DRAFT }),
      );
    });

    it('does not reseed when a row already exists for the site', async () => {
      repo.findOne.mockResolvedValue({ id: 'cta-1', siteId });

      await service.onModuleInit();

      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('swaps background image media usage', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'cta-1',
        siteId,
        title: { fa: 'عنوان' },
        primaryButtonLabel: { fa: 'ثبت‌نام' },
        primaryButtonUrl: '/enroll',
        backgroundImageMediaId: 'media-old',
        status: PublishStatus.DRAFT,
      });

      await service.update({ backgroundImageMediaId: 'media-new' });

      expect(media.detach).toHaveBeenCalledWith('media-old', 'cta', 'cta-1');
      expect(media.attach).toHaveBeenCalledWith('media-new', 'cta', 'cta-1');
    });

    it('clears the secondary button when explicitly set to null', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'cta-1',
        siteId,
        title: { fa: 'عنوان' },
        primaryButtonLabel: { fa: 'ثبت‌نام' },
        primaryButtonUrl: '/enroll',
        secondaryButtonLabel: { fa: 'بیشتر بدانید' },
        secondaryButtonUrl: '/about',
        status: PublishStatus.DRAFT,
      });

      const result = await service.update({
        secondaryButtonLabel: null,
        secondaryButtonUrl: null,
      });

      expect(result.secondaryButtonLabel).toBeUndefined();
      expect(result.secondaryButtonUrl).toBeUndefined();
    });

    it('leaves fields untouched when omitted from the dto', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'cta-1',
        siteId,
        title: { fa: 'عنوان' },
        primaryButtonLabel: { fa: 'ثبت‌نام' },
        primaryButtonUrl: '/enroll',
        status: PublishStatus.DRAFT,
      });

      const result = await service.update({ primaryButtonUrl: '/apply' });

      expect(result.title).toEqual({ fa: 'عنوان' });
      expect(result.primaryButtonUrl).toBe('/apply');
    });
  });

  describe('updateStatus', () => {
    it('delegates transition validation to PublishingService', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'cta-1',
        siteId,
        status: PublishStatus.DRAFT,
      });

      const result = await service.updateStatus(PublishStatus.PUBLISHED);

      expect(publishing.transition).toHaveBeenCalledWith({
        from: PublishStatus.DRAFT,
        to: PublishStatus.PUBLISHED,
        entityType: 'cta',
        entityId: 'cta-1',
        siteId,
      });
      expect(result.status).toBe(PublishStatus.PUBLISHED);
    });
  });
});
