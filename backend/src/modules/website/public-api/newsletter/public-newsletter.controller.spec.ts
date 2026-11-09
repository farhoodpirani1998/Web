import { PublicNewsletterController } from './public-newsletter.controller';

describe('PublicNewsletterController', () => {
  it('returns only a generic receipt, never subscriber data', async () => {
    const newsletter = { subscribe: jest.fn().mockResolvedValue(undefined) };
    const controller = new PublicNewsletterController(newsletter as any);

    const response = await controller.subscribe({ email: 'private@example.com' });

    expect(newsletter.subscribe).toHaveBeenCalledWith('private@example.com');
    expect(response).toEqual({
      message: 'در صورت معتبر بودن ایمیل، عضویت شما ثبت شده است.',
    });
    expect(JSON.stringify(response)).not.toContain('private@example.com');
  });
});
