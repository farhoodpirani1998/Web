import { validate } from 'class-validator';

import { CreatePreRegistrationDto } from './dto/create-pre-registration.dto';

const validPayload = {
  studentFirstName: 'علی',
  studentLastName: 'محمدی',
  studentNationalId: '0012345678',
  studentBirthDate: '2015-01-01',
  studentGrade: 'grade-1',
  guardianFullName: 'رضا محمدی',
  guardianPhone: '09121234567',
};

describe('CreatePreRegistrationDto', () => {
  it('accepts normalized 10-digit national ids and 11-digit Iranian phones', async () => {
    const dto = Object.assign(new CreatePreRegistrationDto(), validPayload);
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects Persian digits and malformed contact numbers', async () => {
    const dto = Object.assign(new CreatePreRegistrationDto(), {
      ...validPayload,
      studentNationalId: '۰۰۱۲۳۴۵۶۷۸',
      guardianPhone: '9121234567',
    });
    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['studentNationalId', 'guardianPhone']),
    );
  });

  it('accepts a campus UUID and rejects a malformed campusId', async () => {
    const valid = Object.assign(new CreatePreRegistrationDto(), {
      ...validPayload,
      campusId: '2a1e2e60-0ed5-4db4-b826-20f592b0878e',
    });
    const invalid = Object.assign(new CreatePreRegistrationDto(), {
      ...validPayload,
      campusId: 'not-a-uuid',
    });

    await expect(validate(valid)).resolves.toHaveLength(0);
    expect((await validate(invalid)).map((error) => error.property)).toContain(
      'campusId',
    );
  });
});
