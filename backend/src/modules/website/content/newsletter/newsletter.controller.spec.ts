import { NewsletterController } from './newsletter.controller';

describe('NewsletterController CSV export', () => {
  it('returns a UTF-8 BOM CSV and neutralizes spreadsheet formulas', async () => {
    const newsletter = {
      findAll: jest.fn().mockResolvedValue([
        {
          email: '=SUM(1,1)',
          createdAt: new Date('2026-01-01T12:00:00.000Z'),
        },
      ]),
      getStats: jest.fn(),
      remove: jest.fn(),
    };
    const controller = new NewsletterController(newsletter as any);

    const csv = await controller.export({});

    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain('"ایمیل","تاریخ عضویت"');
    expect(csv).toContain('"\'=SUM(1,1)"');
  });
});
