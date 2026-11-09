import { NotFoundException } from '@nestjs/common';
import { ContactMessagesService } from './contact-messages.service';
import { ContactMessageStatus } from './entities/contact-message-status.enum';
import { ContactMessageSubject } from './entities/contact-message-subject.enum';

describe('ContactMessagesService', () => {
  const siteId = 'site-1';
  let repo: any;
  let siteService: any;
  let service: ContactMessagesService;

  beforeEach(() => {
    repo = {
      create: jest.fn((data) => data),
      save: jest.fn(async (data) => ({ id: 'message-1', ...data })),
      find: jest.fn(),
      findOneBy: jest.fn(),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    siteService = { getDefaultSiteId: jest.fn().mockReturnValue(siteId) };
    service = new ContactMessagesService(repo, siteService);
  });

  it('stores trimmed submissions as new messages scoped to the default site', async () => {
    await service.create({
      fullName: '  نگار رضایی ',
      phone: ' 09123456789 ',
      subject: ContactMessageSubject.COURSE_INFORMATION,
      message: ' دربارهٔ دوره‌ها راهنمایی می‌خواستم. ',
    });

    expect(repo.create).toHaveBeenCalledWith({
      siteId,
      fullName: 'نگار رضایی',
      phone: '09123456789',
      subject: ContactMessageSubject.COURSE_INFORMATION,
      message: 'دربارهٔ دوره‌ها راهنمایی می‌خواستم.',
      status: ContactMessageStatus.NEW,
    });
    expect(repo.save).toHaveBeenCalled();
  });

  it('lists only this site’s messages newest first', async () => {
    await service.findAll();
    expect(repo.find).toHaveBeenCalledWith({
      where: { siteId },
      order: { createdAt: 'DESC' },
    });
  });

  it('updates status only for a message belonging to the current site', async () => {
    repo.findOneBy.mockResolvedValue({
      id: 'message-1',
      siteId,
      status: ContactMessageStatus.NEW,
    });

    const updated = await service.updateStatus(
      'message-1',
      ContactMessageStatus.CONTACTED,
    );

    expect(repo.findOneBy).toHaveBeenCalledWith({ id: 'message-1', siteId });
    expect(updated.status).toBe(ContactMessageStatus.CONTACTED);
  });

  it('does not expose a message from another site while updating its status', async () => {
    repo.findOneBy.mockResolvedValue(null);
    await expect(
      service.updateStatus('message-1', ContactMessageStatus.CLOSED),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deletes only within the current site', async () => {
    await service.remove('message-1');
    expect(repo.delete).toHaveBeenCalledWith({ id: 'message-1', siteId });
  });
});
