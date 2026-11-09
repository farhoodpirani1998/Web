import { PublicPreRegistrationController } from './public-pre-registration.controller';

describe('PublicPreRegistrationController', () => {
  it('returns only the reference code after creating a submission', async () => {
    const service = {
      create: jest.fn().mockResolvedValue({
        id: 'registration-1',
        referenceCode: 'NH-0123456789ABCDEF',
      }),
    };
    const controller = new PublicPreRegistrationController(service as any);

    await expect(controller.create({} as any)).resolves.toEqual({
      referenceCode: 'NH-0123456789ABCDEF',
    });
    expect(service.create).toHaveBeenCalledWith({});
  });
});
