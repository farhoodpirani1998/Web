import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SubscribeNewsletterDto } from './subscribe-newsletter.dto';

describe('SubscribeNewsletterDto', () => {
  it('trims and lowercases an email address', async () => {
    const dto = plainToInstance(SubscribeNewsletterDto, {
      email: '  USER@Example.COM ',
    });

    expect(dto.email).toBe('user@example.com');
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects invalid addresses and overlong values', async () => {
    const dto = plainToInstance(SubscribeNewsletterDto, {
      email: 'not-an-email',
    });
    await expect(validate(dto)).resolves.not.toHaveLength(0);
  });
});
