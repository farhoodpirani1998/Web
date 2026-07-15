import { TestimonialsService } from './testimonials.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

describe('TestimonialsService', () => {
  const siteId = 'site-1';
  let repo: any;
  let siteService: any;
  let ordering: any;
  let publishing: any;
  let media: any;
  let service: TestimonialsService;

  beforeEach(() => {
    repo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: null }),
      }),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'testimonial-1', ...data })),
      find: jest.fn(),
      findOneByOrFail: jest.fn(),
      delete: jest.fn(),
      manager: {},
    };
    siteService = { getDefaultSiteId: jest.fn().mockReturnValue(siteId) };
    ordering = { reorder: jest.fn() };
    publishing = { transition: jest.fn() };
    media = { attach: jest.fn(), detach: jest.fn() };
    service = new TestimonialsService(repo, siteService, ordering, publishing, media);
  });

  describe('create', () => {
    it('attaches the avatar media usage when an avatarMediaId is provided', async () => {
      const testimonial = await service.create({
        authorName: 'Jane Doe',
        content: { fa: 'عالی بود' },
        avatarMediaId: 'media-1',
      });

      expect(testimonial.status).toBe(PublishStatus.DRAFT);
      expect(media.attach).toHaveBeenCalledWith('media-1', 'testimonial', 'testimonial-1');
    });

    it('does not call attach when no avatarMediaId is given', async () => {
      await service.create({ authorName: 'Jane Doe', content: { fa: 'عالی بود' } });
      expect(media.attach).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('detaches the old avatar and attaches the new one when it changes', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'testimonial-1',
        siteId,
        authorName: 'Jane Doe',
        content: { fa: 'قبلی' },
        avatarMediaId: 'media-old',
        status: PublishStatus.DRAFT,
      });

      await service.update('testimonial-1', { avatarMediaId: 'media-new' });

      expect(media.detach).toHaveBeenCalledWith('media-old', 'testimonial', 'testimonial-1');
      expect(media.attach).toHaveBeenCalledWith('media-new', 'testimonial', 'testimonial-1');
    });

    it('leaves media usage untouched when avatarMediaId is not part of the update', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'testimonial-1',
        siteId,
        authorName: 'Jane Doe',
        content: { fa: 'قبلی' },
        avatarMediaId: 'media-old',
        status: PublishStatus.DRAFT,
      });

      await service.update('testimonial-1', { authorName: 'New Name' });

      expect(media.detach).not.toHaveBeenCalled();
      expect(media.attach).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('detaches the avatar media usage before deleting', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'testimonial-1',
        siteId,
        avatarMediaId: 'media-1',
        status: PublishStatus.DRAFT,
      });

      await service.remove('testimonial-1');

      expect(media.detach).toHaveBeenCalledWith('media-1', 'testimonial', 'testimonial-1');
      expect(repo.delete).toHaveBeenCalledWith({ id: 'testimonial-1' });
    });
  });

  describe('updateStatus', () => {
    it('delegates transition validation to PublishingService', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'testimonial-1',
        siteId,
        status: PublishStatus.DRAFT,
      });

      const result = await service.updateStatus('testimonial-1', PublishStatus.PUBLISHED);

      expect(publishing.transition).toHaveBeenCalledWith({
        from: PublishStatus.DRAFT,
        to: PublishStatus.PUBLISHED,
        entityType: 'testimonial',
        entityId: 'testimonial-1',
        siteId,
      });
      expect(result.status).toBe(PublishStatus.PUBLISHED);
    });
  });
});
