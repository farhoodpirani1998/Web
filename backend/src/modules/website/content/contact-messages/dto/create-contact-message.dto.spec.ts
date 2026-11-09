import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateContactMessageDto } from './create-contact-message.dto';
import { ContactMessageSubject } from '../entities/contact-message-subject.enum';

describe('CreateContactMessageDto', () => {
  const validPayload = {
    fullName: 'نگار رضایی',
    phone: '09123456789',
    subject: ContactMessageSubject.EDUCATIONAL_CONSULTATION,
    message: 'برای انتخاب دوره راهنمایی می‌خواستم.',
  };

  it('accepts a complete message with a supported subject', () => {
    const dto = plainToInstance(CreateContactMessageDto, validPayload);
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('rejects unsupported subjects and oversized message content', () => {
    const dto = plainToInstance(CreateContactMessageDto, {
      ...validPayload,
      subject: 'unknown',
      message: 'x'.repeat(5001),
    });

    expect(validateSync(dto).length).toBeGreaterThan(0);
  });

  it('rejects phone numbers that were not normalized to an Iranian mobile number', () => {
    const dto = plainToInstance(CreateContactMessageDto, {
      ...validPayload,
      phone: '+989123456789',
    });

    expect(validateSync(dto).some((error) => error.property === 'phone')).toBe(
      true,
    );
  });
});
