import { PreRegistrationsService } from './pre-registrations.service';
import { PreRegistrationStatus } from './entities/pre-registration-status.enum';

describe('PreRegistrationsService', () => {
  const siteId = 'site-1';
  let repo: any;
  let siteService: any;
  let service: PreRegistrationsService;

  const baseDto = {
    studentFirstName: 'علی',
    studentLastName: 'محمدی',
    studentNationalId: '0012345678',
    studentBirthDate: '2015-01-01',
    studentGrade: 'grade-1',
    guardianFullName: 'رضا محمدی',
    guardianPhone: '09120000000',
  };

  beforeEach(() => {
    repo = {
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'pre-reg-1', ...data })),
      find: jest.fn(),
      findOneByOrFail: jest.fn(),
      delete: jest.fn(),
    };
    siteService = { getDefaultSiteId: jest.fn().mockReturnValue(siteId) };
    service = new PreRegistrationsService(repo, siteService);
  });

  describe('create', () => {
    it('scopes the submission to the default site and defaults status to NEW', async () => {
      const preRegistration = await service.create(baseDto);

      expect(preRegistration.siteId).toBe(siteId);
      expect(preRegistration.status).toBe(PreRegistrationStatus.NEW);
      expect(preRegistration.studentFirstName).toBe(baseDto.studentFirstName);
    });
  });

  describe('findAll', () => {
    it('filters by status when provided', async () => {
      await service.findAll(PreRegistrationStatus.CONTACTED);

      expect(repo.find).toHaveBeenCalledWith({
        where: { siteId, status: PreRegistrationStatus.CONTACTED },
        order: { createdAt: 'DESC' },
      });
    });

    it('omits the status filter when not provided', async () => {
      await service.findAll();

      expect(repo.find).toHaveBeenCalledWith({
        where: { siteId },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('updateStatus', () => {
    it('assigns and persists the new status directly (no transition validation)', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'pre-reg-1',
        siteId,
        status: PreRegistrationStatus.NEW,
      });

      const result = await service.updateStatus('pre-reg-1', PreRegistrationStatus.CONTACTED);

      expect(result.status).toBe(PreRegistrationStatus.CONTACTED);
    });
  });

  describe('remove', () => {
    it('deletes by id', async () => {
      await service.remove('pre-reg-1');
      expect(repo.delete).toHaveBeenCalledWith({ id: 'pre-reg-1' });
    });
  });
});
