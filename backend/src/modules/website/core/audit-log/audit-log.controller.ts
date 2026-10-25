import { Controller, Get, Query } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { SiteService } from '../site/site.service';
import { RequireCmsPermission } from '../../identity/auth/cms-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';

/**
 * Admin surface for the CMS activity feed — both the Dashboard's short
 * "Recent Activity" slice and the fuller Audit Log page
 * (`features/cms/audit-log`). Gated behind `CONTENT_READ`, same
 * permission the Dashboard's other KPI data already requires — this
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

  /**
   * `?limit=` caps how many recent entries come back. Optional — the
   * Dashboard omits it (service default); the Audit Log page asks for
   * more. Parsed leniently and clamped server-side (`AuditLogService`),
   * so a missing/garbage value never 400s.
   */
  @Get()
  @RequireCmsPermission(WebsitePermission.CONTENT_READ)
  listRecent(@Query('limit') limit?: string) {
    const parsed = limit !== undefined ? parseInt(limit, 10) : undefined;
    return this.auditLog.listRecent(
      this.siteService.getDefaultSiteId(),
      Number.isFinite(parsed) ? (parsed as number) : undefined,
    );
  }
}
