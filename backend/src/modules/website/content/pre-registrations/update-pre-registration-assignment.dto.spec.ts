import { validate } from 'class-validator';
import { UpdatePreRegistrationAssignmentDto } from './dto/update-pre-registration-assignment.dto';

describe('UpdatePreRegistrationAssignmentDto', () => {
  it('accepts a nullable assignment and an ISO follow-up timestamp', async () => {
    const dto = Object.assign(new UpdatePreRegistrationAssignmentDto(), {
      assignedAdminId: '2a1e2e60-0ed5-4db4-b826-20f592b0878e',
      followUpAt: '2026-12-01T10:00:00.000Z',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects malformed administrator UUIDs and dates', async () => {
    const dto = Object.assign(new UpdatePreRegistrationAssignmentDto(), {
      assignedAdminId: 'not-a-uuid',
      followUpAt: 'tomorrow',
    });

    expect((await validate(dto)).map((error) => error.property)).toEqual(
      expect.arrayContaining(['assignedAdminId', 'followUpAt']),
    );
  });
});
