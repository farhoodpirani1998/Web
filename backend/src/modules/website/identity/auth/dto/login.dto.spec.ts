import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('trims and lowercases email before validation', async () => {
    const dto = plainToInstance(LoginDto, {
      email: '  Admin@Example.COM  ',
      password: 'a-valid-password',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.email).toBe('admin@example.com');
  });

  it('does not alter the password', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'admin@example.com',
      password: '  spaced password  ',
    });

    expect(dto.password).toBe('  spaced password  ');
  });

  it('still rejects a malformed email after normalization', async () => {
    const dto = plainToInstance(LoginDto, {
      email: '  not-an-email  ',
      password: 'a-valid-password',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });
});
