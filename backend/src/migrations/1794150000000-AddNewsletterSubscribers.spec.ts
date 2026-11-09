import { AddNewsletterSubscribers1794150000000 } from './1794150000000-AddNewsletterSubscribers';

describe('AddNewsletterSubscribers1794150000000', () => {
  it('creates a site-scoped subscriber table with unique email and date indexes', async () => {
    const queryRunner = { query: jest.fn().mockResolvedValue(undefined) } as any;
    await new AddNewsletterSubscribers1794150000000().up(queryRunner);

    const sql = (queryRunner.query.mock.calls as unknown[][])
      .map(([statement]) => String(statement))
      .join('\n');
    expect(sql).toContain('CREATE TABLE "newsletter_subscribers"');
    expect(sql).toContain('("siteId", "email")');
    expect(sql).toContain('("siteId", "createdAt")');
  });

  it('drops the table on rollback', async () => {
    const queryRunner = { query: jest.fn().mockResolvedValue(undefined) } as any;
    await new AddNewsletterSubscribers1794150000000().down(queryRunner);
    expect(queryRunner.query).toHaveBeenCalledWith(
      'DROP TABLE "newsletter_subscribers"',
    );
  });
});
