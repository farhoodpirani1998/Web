import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntry } from './entities/audit-log-entry.entity';

/** Default slice size when the caller doesn't ask for a specific `limit` (Dashboard's Recent Activity). */
const DEFAULT_RECENT_LIMIT = 20;

/**
 * Upper bound on how many rows a single request may pull. The Audit Log
 * page asks for more than the Dashboard's default, but this is a
 * read-only viewer with no pagination — the cap keeps one request from
 * scanning an unbounded table (and keeps the response small) as the log
 * grows.
 */
const MAX_RECENT_LIMIT = 500;

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

  async listRecent(siteId: string, limit?: number): Promise<AuditLogEntry[]> {
    const take = Math.min(
      Math.max(
        Number.isFinite(limit) ? (limit as number) : DEFAULT_RECENT_LIMIT,
        1,
      ),
      MAX_RECENT_LIMIT,
    );
    return this.repo.find({
      where: { siteId },
      order: { createdAt: 'DESC' },
      take,
    });
  }
}
