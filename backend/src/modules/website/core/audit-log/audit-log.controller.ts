import { Controller, Get } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { SiteService } from '../site/site.service';
import { RequireCmsPermission } from '../../identity/auth/cms-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';

/**
 * Admin surface for "Recent Activity" (`DashboardRecentActivity.tsx`).
 * Gated behind `CONTENT_READ`, same permission the Dashboard's other
 * KPI data already requires (`DashboardPage`'s own comment) — this
 * isn't a distinct capability from viewing the rest of the CMS.
 *
 * Read-only: nothing ever writes here directly (see
 * `AuditLogListener`'s own comment for how rows get created).
 */
@Controller('admin/audit-log')
export class AuditLogController {
  constructor(
    private readonly auditLog: AuditLogService,
    private readonly siteService: SiteService,
  ) {}

  @Get()
  @RequireCmsPermission(WebsitePermission.CONTENT_READ)
  listRecent() {
    return this.auditLog.listRecent(this.siteService.getDefaultSiteId());
  }
}
