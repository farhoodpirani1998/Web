import { GalleryService } from './gallery.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

describe('GalleryService', () => {
  const siteId = 'site-1';
  let repo: any;
  let siteService: any;
  let ordering: any;
  let publishing: any;
  let media: any;
  let service: GalleryService;

  beforeEach(() => {
    repo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: null }),
      }),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'gallery-item-1', ...data })),
      find: jest.fn(),
      findOneByOrFail: jest.fn(),
      delete: jest.fn(),
      manager: {},
    };
    siteService = { getDefaultSiteId: jest.fn().mockReturnValue(siteId) };
    ordering = { reorder: jest.fn() };
    publishing = { transition: jest.fn() };
    media = { attach: jest.fn(), detach: jest.fn() };
    service = new GalleryService(repo, siteService, ordering, publishing, media);
  });

  describe('create', () => {
    it('attaches the image media usage unconditionally', async () => {
      const item = await service.create({ imageMediaId: 'media-1' });

      expect(item.status).toBe(PublishStatus.DRAFT);
      expect(media.attach).toHaveBeenCalledWith(
        'media-1',
        'gallery_item',
        'gallery-item-1',
      );
    });
  });

  describe('update', () => {
    it('detaches the old image and attaches the new one when it changes', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'gallery-item-1',
        siteId,
        imageMediaId: 'media-old',
        status: PublishStatus.DRAFT,
      });

      await service.update('gallery-item-1', { imageMediaId: 'media-new' });

      expect(media.detach).toHaveBeenCalledWith(
        'media-old',
        'gallery_item',
        'gallery-item-1',
      );
      expect(media.attach).toHaveBeenCalledWith(
        'media-new',
        'gallery_item',
        'gallery-item-1',
      );
    });

    it('leaves media usage untouched when imageMediaId is not part of the update', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'gallery-item-1',
        siteId,
        imageMediaId: 'media-old',
        category: 'campus',
        status: PublishStatus.DRAFT,
      });

      await service.update('gallery-item-1', { category: 'events' });

      expect(media.detach).not.toHaveBeenCalled();
      expect(media.attach).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('detaches the image media usage before deleting', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'gallery-item-1',
        siteId,
        imageMediaId: 'media-1',
        status: PublishStatus.DRAFT,
      });

      await service.remove('gallery-item-1');

      expect(media.detach).toHaveBeenCalledWith(
        'media-1',
        'gallery_item',
        'gallery-item-1',
      );
      expect(repo.delete).toHaveBeenCalledWith({ id: 'gallery-item-1' });
    });
  });

  describe('updateStatus', () => {
    it('delegates transition validation to PublishingService', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'gallery-item-1',
        siteId,
        status: PublishStatus.DRAFT,
      });

      const result = await service.updateStatus('gallery-item-1', PublishStatus.PUBLISHED);

      expect(publishing.transition).toHaveBeenCalledWith({
        from: PublishStatus.DRAFT,
        to: PublishStatus.PUBLISHED,
        entityType: 'gallery_item',
        entityId: 'gallery-item-1',
        siteId,
      });
      expect(result.status).toBe(PublishStatus.PUBLISHED);
    });
  });

  describe('reorder', () => {
    it('delegates to OrderingService with the gallery_items table name', async () => {
      await service.reorder(['a', 'b', 'c']);
      expect(ordering.reorder).toHaveBeenCalledWith(repo.manager, 'gallery_items', [
        'a',
        'b',
        'c',
      ]);
    });
  });
});
