import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from './entities/site.entity';

const DEFAULT_SITE_KEY = 'main';

@Injectable()
export class SiteService implements OnModuleInit {
  private defaultSiteId: string | null = null;

  constructor(
    @InjectRepository(Site)
    private readonly siteRepo: Repository<Site>,
  ) {}

  /** Seeds the "main" site row if it doesn't exist yet, and caches its id. */
  async onModuleInit() {
    let site = await this.siteRepo.findOne({ where: { key: DEFAULT_SITE_KEY } });
    if (!site) {
      site = await this.siteRepo.save(
        this.siteRepo.create({ key: DEFAULT_SITE_KEY, name: 'Main Site' }),
      );
    }
    this.defaultSiteId = site.id;
  }

  /**
   * Treated as a known constant, not resolved per-request — deliberate,
   * since only one Site exists today. Becomes request-scoped resolution
   * only when a second site is an actual requirement.
   */
  getDefaultSiteId(): string {
    if (!this.defaultSiteId) {
      throw new Error('SiteService not initialized yet');
    }
    return this.defaultSiteId;
  }
}
