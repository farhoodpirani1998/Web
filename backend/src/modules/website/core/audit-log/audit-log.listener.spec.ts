import { AuditLogListener } from './audit-log.listener';
import { AuditLogService } from './audit-log.service';
import { SiteService } from '../site/site.service';
import { PublishStatus } from '../publishing/publish-status.enum';

describe('AuditLogListener', () => {
  let auditLog: { record: jest.Mock };
  let siteService: { getDefaultSiteId: jest.Mock };
  let listener: AuditLogListener;

  beforeEach(() => {
    auditLog = { record: jest.fn() };
    siteService = { getDefaultSiteId: jest.fn().mockReturnValue('site-1') };
    listener = new AuditLogListener(
      auditLog as unknown as AuditLogService,
      siteService as unknown as SiteService,
    );
  });

  it('records a CONTENT_UPDATED event with the new status as the action', async () => {
    await listener.handleContentUpdated({
      entityType: 'hero',
      entityId: 'entity-1',
      siteId: 'site-1',
      status: PublishStatus.PUBLISHED,
    });

    expect(auditLog.record).toHaveBeenCalledWith({
      siteId: 'site-1',
      action: PublishStatus.PUBLISHED,
      entityType: 'hero',
      entityId: 'entity-1',
    });
  });

  it('resolves siteId via SiteService for a MEDIA_UPLOADED event, since the payload has none', async () => {
    await listener.handleMediaUploaded({ mediaId: 'media-1' });

    expect(siteService.getDefaultSiteId).toHaveBeenCalled();
    expect(auditLog.record).toHaveBeenCalledWith({
      siteId: 'site-1',
      action: 'media_uploaded',
      entityType: 'media',
      entityId: 'media-1',
    });
  });

  it('records a SETTINGS_UPDATED event with the group in metadata, no entityType/entityId', async () => {
    await listener.handleSettingsUpdated({ siteId: 'site-1', group: 'seo' });

    expect(auditLog.record).toHaveBeenCalledWith({
      siteId: 'site-1',
      action: 'settings_updated',
      metadata: { group: 'seo' },
    });
  });
});
