import { NewsletterService } from './newsletter.service';

describe('NewsletterService', () => {
  let repo: any;
  let siteService: any;
  let auditLog: any;
  let service: NewsletterService;

  beforeEach(() => {
    repo = {
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => ({ id: 'subscriber-1', ...value })),
      count: jest.fn().mockResolvedValue(10),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      createQueryBuilder: jest.fn(),
    };
    siteService = { getDefaultSiteId: jest.fn().mockReturnValue('site-1') };
    auditLog = { record: jest.fn().mockResolvedValue(undefined) };
    service = new NewsletterService(repo, siteService, auditLog);
  });

  it('stores normalized email once and audits without including the address', async () => {
    await service.subscribe('  USER@Example.COM ');

    expect(repo.create).toHaveBeenCalledWith({
      siteId: 'site-1',
      email: 'user@example.com',
    });
    expect(auditLog.record).toHaveBeenCalledWith({
      siteId: 'site-1',
      action: 'newsletter_subscribed',
      entityType: 'newsletter_subscriber',
      entityId: 'subscriber-1',
    });
    expect(JSON.stringify(auditLog.record.mock.calls[0])).not.toContain(
      'user@example.com',
    );
  });

  it('treats a unique-email race as an idempotent public subscription', async () => {
    repo.save.mockRejectedValue({
      driverError: { code: '23505' },
    });

    await expect(
      service.subscribe('user@example.com'),
    ).resolves.toBeUndefined();
    expect(auditLog.record).not.toHaveBeenCalled();
  });

  it('applies site, email, and inclusive date filters to the admin list', async () => {
    const builder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    repo.createQueryBuilder.mockReturnValue(builder);

    await service.findAll({
      search: 'EXAMPLE',
      from: '2026-01-02',
      to: '2026-01-04',
    });

    expect(builder.where).toHaveBeenCalledWith('subscriber.siteId = :siteId', {
      siteId: 'site-1',
    });
    expect(builder.andWhere).toHaveBeenNthCalledWith(
      1,
      'LOWER(subscriber.email) LIKE LOWER(:search)',
      { search: '%EXAMPLE%' },
    );
    expect(builder.andWhere).toHaveBeenNthCalledWith(
      2,
      'subscriber.createdAt >= :from',
      { from: new Date('2026-01-02T00:00:00.000Z') },
    );
    expect(builder.andWhere).toHaveBeenNthCalledWith(
      3,
      'subscriber.createdAt < :to',
      { to: new Date('2026-01-05T00:00:00.000Z') },
    );
  });

  it('returns site-scoped total, today, and current-month subscriber counts', async () => {
    const builder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValueOnce(2).mockResolvedValueOnce(5),
    };
    repo.createQueryBuilder.mockReturnValue(builder);

    await expect(service.getStats()).resolves.toEqual({
      total: 10,
      today: 2,
      thisMonth: 5,
    });
    expect(repo.count).toHaveBeenCalledWith({ where: { siteId: 'site-1' } });
  });

  it('deletes only within the default site and records an audit event', async () => {
    await service.remove('subscriber-1');

    expect(repo.delete).toHaveBeenCalledWith({
      id: 'subscriber-1',
      siteId: 'site-1',
    });
    expect(auditLog.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'newsletter_subscriber_deleted',
        entityId: 'subscriber-1',
      }),
    );
  });
});
