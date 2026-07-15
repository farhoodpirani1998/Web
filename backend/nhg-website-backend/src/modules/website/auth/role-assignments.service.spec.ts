import { ConflictException } from '@nestjs/common';
import { RoleAssignmentsService } from './role-assignments.service';
import { WebsiteRole } from './website-role.enum';

describe('RoleAssignmentsService', () => {
  let repo: any;
  let service: RoleAssignmentsService;

  beforeEach(() => {
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneByOrFail: jest.fn(),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'role-assignment-1', ...data })),
      delete: jest.fn(),
      count: jest.fn(),
    };
    service = new RoleAssignmentsService(repo);
  });

  describe('assign', () => {
    it('creates a new assignment when none exists yet', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.assign('sms-user-1', WebsiteRole.CONTENT_EDITOR);

      expect(repo.create).toHaveBeenCalledWith({
        externalUserId: 'sms-user-1',
        role: WebsiteRole.CONTENT_EDITOR,
      });
      expect(result.role).toBe(WebsiteRole.CONTENT_EDITOR);
    });

    it('changes the role on an existing assignment', async () => {
      repo.findOne.mockResolvedValue({
        externalUserId: 'sms-user-1',
        role: WebsiteRole.CONTENT_EDITOR,
      });

      const result = await service.assign('sms-user-1', WebsiteRole.PUBLISHER);

      expect(result.role).toBe(WebsiteRole.PUBLISHER);
    });

    it('blocks demoting the last Super Admin', async () => {
      repo.findOne.mockResolvedValue({
        externalUserId: 'sms-user-1',
        role: WebsiteRole.SUPER_ADMIN,
      });
      repo.count.mockResolvedValue(1);

      await expect(
        service.assign('sms-user-1', WebsiteRole.CONTENT_EDITOR),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('allows demoting a Super Admin when others remain', async () => {
      repo.findOne.mockResolvedValue({
        externalUserId: 'sms-user-1',
        role: WebsiteRole.SUPER_ADMIN,
      });
      repo.count.mockResolvedValue(2);

      const result = await service.assign('sms-user-1', WebsiteRole.CONTENT_EDITOR);
      expect(result.role).toBe(WebsiteRole.CONTENT_EDITOR);
    });
  });

  describe('remove', () => {
    it('deletes a non-super-admin assignment', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        externalUserId: 'sms-user-1',
        role: WebsiteRole.MEDIA_MANAGER,
      });

      await service.remove('sms-user-1');

      expect(repo.delete).toHaveBeenCalledWith({ externalUserId: 'sms-user-1' });
    });

    it('blocks removing the last Super Admin', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        externalUserId: 'sms-user-1',
        role: WebsiteRole.SUPER_ADMIN,
      });
      repo.count.mockResolvedValue(1);

      await expect(service.remove('sms-user-1')).rejects.toBeInstanceOf(ConflictException);
      expect(repo.delete).not.toHaveBeenCalled();
    });

    it('allows removing a Super Admin when others remain', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        externalUserId: 'sms-user-1',
        role: WebsiteRole.SUPER_ADMIN,
      });
      repo.count.mockResolvedValue(2);

      await service.remove('sms-user-1');
      expect(repo.delete).toHaveBeenCalledWith({ externalUserId: 'sms-user-1' });
    });
  });
});
