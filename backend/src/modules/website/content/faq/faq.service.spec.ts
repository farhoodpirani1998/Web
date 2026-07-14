import { FaqService } from './faq.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

describe('FaqService', () => {
  const siteId = 'site-1';
  let faqRepo: any;
  let siteService: any;
  let ordering: any;
  let publishing: any;
  let service: FaqService;

  beforeEach(() => {
    faqRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: 1 }),
      }),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'faq-1', ...data })),
      find: jest.fn(),
      findOneByOrFail: jest.fn(),
      delete: jest.fn(),
      manager: {},
    };
    siteService = { getDefaultSiteId: jest.fn().mockReturnValue(siteId) };
    ordering = { reorder: jest.fn() };
    publishing = { transition: jest.fn() };
    service = new FaqService(faqRepo, siteService, ordering, publishing);
  });

  describe('create', () => {
    it('assigns the next position after the current max for the site', async () => {
      const faq = await service.create({
        question: { fa: 'چیست؟' },
        answer: { fa: 'این است.' },
      });

      expect(faq.position).toBe(2);
      expect(faq.siteId).toBe(siteId);
      expect(faq.status).toBe(PublishStatus.DRAFT);
    });

    it('starts at position 0 when no FAQs exist yet for the site', async () => {
      faqRepo.createQueryBuilder().getRawOne.mockResolvedValueOnce({ max: null });

      const faq = await service.create({
        question: { fa: 'چیست؟' },
        answer: { fa: 'این است.' },
      });

      expect(faq.position).toBe(0);
    });
  });

  describe('updateStatus', () => {
    it('delegates transition validation to PublishingService and persists the new status', async () => {
      faqRepo.findOneByOrFail.mockResolvedValue({
        id: 'faq-1',
        siteId,
        status: PublishStatus.DRAFT,
      });

      const result = await service.updateStatus('faq-1', PublishStatus.PUBLISHED);

      expect(publishing.transition).toHaveBeenCalledWith({
        from: PublishStatus.DRAFT,
        to: PublishStatus.PUBLISHED,
        entityType: 'faq',
        entityId: 'faq-1',
        siteId,
      });
      expect(result.status).toBe(PublishStatus.PUBLISHED);
    });
  });

  describe('reorder', () => {
    it('delegates to OrderingService against the faqs table', async () => {
      await service.reorder(['a', 'b', 'c']);
      expect(ordering.reorder).toHaveBeenCalledWith(
        faqRepo.manager,
        'faqs',
        ['a', 'b', 'c'],
      );
    });
  });
});
