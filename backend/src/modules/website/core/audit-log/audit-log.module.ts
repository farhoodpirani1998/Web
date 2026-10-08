import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogEntry } from './entities/audit-log-entry.entity';
import { AuditLogService } from './audit-log.service';
import { AuditLogListener } from './audit-log.listener';
import { AuditLogController } from './audit-log.controller';
import { SiteModule } from '../site/site.module';
import { CmsAuthModule } from '../../identity/auth/cms-auth.module';

/**
 * `AuditLogListener` is registered as a plain provider, not imported
 * anywhere else — `@nestjs/event-emitter`'s global `EventEmitter2`
 * (registered once via `EventsModule.forRoot()` in `WebsiteModule`)
 * discovers `@OnEvent` handlers on any provider in the DI graph, so
 * simply instantiating this module is enough to start receiving
 * events; no explicit subscription wiring is needed here.
 */
@Module({
  imports: [TypeOrmModule.forFeature([AuditLogEntry]), SiteModule, CmsAuthModule],
  controllers: [AuditLogController],
  providers: [AuditLogService, AuditLogListener],
  exports: [AuditLogService],
})
export class AuditLogModule {}
