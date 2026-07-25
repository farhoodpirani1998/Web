import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  HealthCheck,
  HealthCheckError,
} from '@nestjs/terminus';
import { MediaService } from '../media/media.service';

/**
 * Unauthenticated by design — this is what a load balancer / uptime
 * monitor polls, so it can't require a JWT. Reveals no data beyond
 * up/down per dependency (no error messages, no stack traces), which
 * `@nestjs/terminus` already handles: a failed indicator's response
 * only carries a generic status, not the thrown error's details.
 */
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly media: MediaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      async () => {
        try {
          await this.media.checkStorageHealth();
          return { storage: { status: 'up' } };
        } catch {
          // HealthCheckService.check() only marks the overall result
          // (and HTTP status) as failed when an indicator throws
          // HealthCheckError — a plain returned { status: 'down' }
          // would be silently treated as passing.
          throw new HealthCheckError('storage check failed', {
            storage: { status: 'down' },
          });
        }
      },
    ]);
  }
}
