import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntry } from './entities/audit-log-entry.entity';

/** Recent Activity only ever shows a short, most-recent slice — never paginated. */
const DEFAULT_RECENT_LIMIT = 20;

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLogEntry)
    private readonly repo: Repository<AuditLogEntry>,
  ) {}

  async record(entry: {
    siteId: string;
    action: string;
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<AuditLogEntry> {
    return this.repo.save(this.repo.create(entry));
  }

  async listRecent(siteId: string, limit = DEFAULT_RECENT_LIMIT): Promise<AuditLogEntry[]> {
    return this.repo.find({
      where: { siteId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
