import { PortalLinksService } from './portal-links.service';
import { WEBSITE_EVENTS } from '../../core/events/events.constants';

describe('PortalLinksService', () => {
  const siteId = 'site-1';
  let repo: any;
  let siteService: any;
  let ordering: any;
  let events: any;
  let service: PortalLinksService;

  beforeEach(() => {
    repo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: null }),
      }),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'portal-link-1', ...data })),
      find: jest.fn(),
      findOneByOrFail: jest.fn(),
      delete: jest.fn(),
      manager: {},
    };
    siteService = { getDefaultSiteId: jest.fn().mockReturnValue(siteId) };
    ordering = { reorder: jest.fn() };
    events = { emit: jest.fn() };
    service = new PortalLinksService(repo, siteService, ordering, events);
  });

  describe('create', () => {
    it('creates a portal link visible by default at position 0 when none exist yet', async () => {
      const portalLink = await service.create({
        label: { fa: 'پورتال والدین' },
        url: 'https://portal.example.com',
      });

      expect(portalLink.visible).toBe(true);
      expect(portalLink.position).toBe(0);
      expect(portalLink.siteId).toBe(siteId);
      expect(events.emit).toHaveBeenCalledWith(
        WEBSITE_EVENTS.SETTINGS_UPDATED,
        { siteId, group: 'portal_links' },
      );
    });

    it('places the new portal link after the current max position', async () => {
      repo.createQueryBuilder().getRawOne.mockResolvedValue({ max: 2 });
      const portalLink = await service.create({
        label: { fa: 'پورتال معلمان' },
        url: 'https://staff.example.com',
      });
      expect(portalLink.position).toBe(3);
    });
  });

  describe('findAll', () => {
    it('scopes to the default site and orders by position', async () => {
      await service.findAll();
      expect(repo.find).toHaveBeenCalledWith({
        where: { siteId },
        order: { position: 'ASC' },
      });
    });
  });

  describe('update', () => {
    it('only overwrites fields present on the DTO', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'portal-link-1',
        siteId,
        label: { fa: 'قدیمی' },
        url: 'https://old.example.com',
        visible: true,
      });

      const updated = await service.update('portal-link-1', { visible: false });

      expect(updated.visible).toBe(false);
      expect(updated.url).toBe('https://old.example.com');
    });
  });

  describe('reorder', () => {
    it('delegates to OrderingService with the portal_links table name', async () => {
      await service.reorder(['a', 'b', 'c']);
      expect(ordering.reorder).toHaveBeenCalledWith(repo.manager, 'portal_links', [
        'a',
        'b',
        'c',
      ]);
      expect(events.emit).toHaveBeenCalledWith(
        WEBSITE_EVENTS.SETTINGS_UPDATED,
        { siteId, group: 'portal_links' },
      );
    });
  });
});
