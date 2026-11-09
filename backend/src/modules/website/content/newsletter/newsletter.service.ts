import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditLogService } from '../../core/audit-log/audit-log.service';
import { SiteService } from '../../core/site/site.service';
import { Repository } from 'typeorm';
import { NewsletterSubscriber } from './entities/newsletter-subscriber.entity';
import { NewsletterSubscribersQueryDto } from './dto/newsletter-subscribers-query.dto';

const DUPLICATE_KEY = '23505';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(NewsletterSubscriber)
    private readonly repo: Repository<NewsletterSubscriber>,
    private readonly siteService: SiteService,
    private readonly auditLog: AuditLogService,
  ) {}

  async subscribe(email: string): Promise<void> {
    const siteId = this.siteService.getDefaultSiteId();
    try {
      const subscriber = await this.repo.save(
        this.repo.create({ siteId, email: email.trim().toLowerCase() }),
      );
      await this.auditLog.record({
        siteId,
        action: 'newsletter_subscribed',
        entityType: 'newsletter_subscriber',
        entityId: subscriber.id,
      });
    } catch (error) {
      if ((error as { driverError?: { code?: string } })?.driverError?.code === DUPLICATE_KEY) {
        return;
      }
      throw error;
    }
  }

  async findAll(query: NewsletterSubscribersQueryDto = {}) {
    const siteId = this.siteService.getDefaultSiteId();
    const builder = this.repo
      .createQueryBuilder('subscriber')
      .where('subscriber.siteId = :siteId', { siteId });

    if (query.search?.trim()) {
      builder.andWhere('LOWER(subscriber.email) LIKE LOWER(:search)', {
        search: `%${query.search.trim()}%`,
      });
    }
    if (query.from) {
      builder.andWhere('subscriber.createdAt >= :from', {
        from: new Date(`${query.from.slice(0, 10)}T00:00:00.000Z`),
      });
    }
    if (query.to) {
      const dayAfterTo = new Date(`${query.to.slice(0, 10)}T00:00:00.000Z`);
      dayAfterTo.setUTCDate(dayAfterTo.getUTCDate() + 1);
      builder.andWhere('subscriber.createdAt < :to', { to: dayAfterTo });
    }
    return builder.orderBy('subscriber.createdAt', 'DESC').getMany();
  }

  async getStats() {
    const siteId = this.siteService.getDefaultSiteId();
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const [total, todayCount, monthCount] = await Promise.all([
      this.repo.count({ where: { siteId } }),
      this.repo
        .createQueryBuilder('subscriber')
        .where('subscriber.siteId = :siteId', { siteId })
        .andWhere('subscriber.createdAt >= :start', { start: today })
        .getCount(),
      this.repo
        .createQueryBuilder('subscriber')
        .where('subscriber.siteId = :siteId', { siteId })
        .andWhere('subscriber.createdAt >= :start', { start: monthStart })
        .getCount(),
    ]);
    return { total, today: todayCount, thisMonth: monthCount };
  }

  async remove(id: string): Promise<void> {
    const siteId = this.siteService.getDefaultSiteId();
    const result = await this.repo.delete({ id, siteId });
    if (!result.affected) throw new NotFoundException();
    await this.auditLog.record({
      siteId,
      action: 'newsletter_subscriber_deleted',
      entityType: 'newsletter_subscriber',
      entityId: id,
    });
  }
}
