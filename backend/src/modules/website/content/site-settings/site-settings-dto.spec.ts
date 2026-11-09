import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UpdateContactSettingsDto } from './dto/update-contact-settings.dto';
import { UpdateSocialLinksDto } from './dto/update-social-links.dto';

describe('site-settings DTO validation', () => {
  it.each([
    [{ mapLatitude: -90, mapLongitude: 180 }, true],
    [{ mapLatitude: -90.01, mapLongitude: 0 }, false],
    [{ mapLatitude: 0, mapLongitude: 180.01 }, false],
  ])('validates map coordinates %#', async (payload, valid) => {
    const errors = await validate(
      plainToInstance(UpdateContactSettingsDto, payload),
    );
    expect(errors.length === 0).toBe(valid);
  });

  it.each([
    [
      {
        workingHours: [
          {
            day: 'saturday',
            openTime: '08:00',
            closeTime: '16:00',
            isClosed: false,
          },
        ],
      },
      true,
    ],
    [
      {
        workingHours: [
          {
            day: 'funday',
            openTime: '8am',
            closeTime: '16:00',
            isClosed: false,
          },
        ],
      },
      false,
    ],
    [
      {
        workingHours: [
          { day: 'saturday', openTime: '08:00', closeTime: '16:00' },
          { day: 'saturday', openTime: '09:00', closeTime: '17:00' },
        ],
      },
      false,
    ],
  ])('validates structured working hours %#', async (payload, valid) => {
    const errors = await validate(
      plainToInstance(UpdateContactSettingsDto, payload),
    );
    expect(errors.length === 0).toBe(valid);
  });

  it('accepts HTTPS social links once per platform', async () => {
    const valid = plainToInstance(UpdateSocialLinksDto, {
      socialLinks: [
        { platform: 'instagram', url: 'https://instagram.com/example' },
        { platform: 'bale', url: 'https://bale.ai/example', active: false },
      ],
    });
    expect(await validate(valid)).toHaveLength(0);

    const invalid = plainToInstance(UpdateSocialLinksDto, {
      socialLinks: [
        { platform: 'instagram', url: 'http://instagram.com/example' },
        { platform: 'instagram', url: 'https://instagram.com/duplicate' },
      ],
    });
    expect(await validate(invalid)).not.toHaveLength(0);
  });
});
