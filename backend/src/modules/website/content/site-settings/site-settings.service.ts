import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SiteSettings } from './entities/site-settings.entity';
import { UpdateGeneralSettingsDto } from './dto/update-general-settings.dto';
import { UpdateContactSettingsDto } from './dto/update-contact-settings.dto';
import { UpdateSocialLinksDto } from './dto/update-social-links.dto';
import { UpdateFeatureFlagsDto } from './dto/update-feature-flags.dto';
import { SeoMetadataDto } from '../common/dto/seo-metadata.dto';
import { SiteService } from '../../core/site/site.service';
import { MediaService } from '../../core/media/media.service';
import { WEBSITE_EVENTS, SettingsUpdatedPayload } from '../../core/events/events.constants';

const ENTITY_TYPE = 'site_settings';

/**
 * Site Settings is a singleton per site — there is exactly one row,
 * auto-seeded on startup the same way AboutService/SiteService seed
 * their own singleton rows, rather than exposing create/delete
 * endpoints for something that always exists exactly once.
 *
 * Each section (General/Contact/Social/SEO/Feature Flags) gets its own
 * update method + its own SETTINGS_UPDATED event with a distinct
 * `group`, so a listener (e.g. cache invalidation, or an audit log)
 * can tell which part of the settings changed without diffing the
 * whole row. Portal Links is handled by PortalLinksService instead —
 * see SiteSettings entity doc for why it's a separate table.
 */
@Injectable()
export class SiteSettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(SiteSettings)
    private readonly settingsRepo: Repository<SiteSettings>,
    private readonly siteService: SiteService,
    private readonly media: MediaService,
    private readonly events: EventEmitter2,
  ) {}

  async onModuleInit() {
    const siteId = this.siteService.getDefaultSiteId();
    const existing = await this.settingsRepo.findOne({ where: { siteId } });
    if (!existing) {
      await this.settingsRepo.save(
        this.settingsRepo.create({
          siteId,
          siteName: { fa: '' },
          socialLinks: [],
          defaultSeo: {},
          featureFlags: {
            newsEnabled: true,
            galleryEnabled: true,
            testimonialsEnabled: true,
            faqEnabled: true,
            eventsEnabled: true,
          },
        }),
      );
    }
  }

  async get(): Promise<SiteSettings> {
    const siteId = this.siteService.getDefaultSiteId();
    return this.settingsRepo.findOneByOrFail({ siteId });
  }

  private emitUpdated(siteId: string, group: string) {
    const payload: SettingsUpdatedPayload = { siteId, group };
    this.events.emit(WEBSITE_EVENTS.SETTINGS_UPDATED, payload);
  }

  /** Attaches/detaches MediaUsage when a media reference field actually changes. */
  private async swapMedia(
    previous: string | undefined,
    next: string | null | undefined,
    settingsId: string,
  ): Promise<void> {
    if (next === undefined || next === previous) return;
    if (previous) await this.media.detach(previous, ENTITY_TYPE, settingsId);
    if (next) await this.media.attach(next, ENTITY_TYPE, settingsId);
  }

  async updateGeneral(dto: UpdateGeneralSettingsDto): Promise<SiteSettings> {
    const settings = await this.get();
    const previousLogoMediaId = settings.logoMediaId;
    const previousFaviconMediaId = settings.faviconMediaId;

    if (dto.siteName !== undefined) settings.siteName = dto.siteName;
    if (dto.tagline !== undefined) settings.tagline = dto.tagline;
    if (dto.logoMediaId !== undefined) settings.logoMediaId = dto.logoMediaId ?? undefined;
    if (dto.faviconMediaId !== undefined) {
      settings.faviconMediaId = dto.faviconMediaId ?? undefined;
    }

    const saved = await this.settingsRepo.save(settings);

    await this.swapMedia(previousLogoMediaId, dto.logoMediaId, saved.id);
    await this.swapMedia(previousFaviconMediaId, dto.faviconMediaId, saved.id);

    this.emitUpdated(saved.siteId, 'general');
    return saved;
  }

  async updateContact(dto: UpdateContactSettingsDto): Promise<SiteSettings> {
    const settings = await this.get();
    if (dto.contactEmail !== undefined) settings.contactEmail = dto.contactEmail;
    if (dto.contactPhone !== undefined) settings.contactPhone = dto.contactPhone;
    if (dto.address !== undefined) settings.address = dto.address;
    if (dto.mapUrl !== undefined) settings.mapUrl = dto.mapUrl;

    const saved = await this.settingsRepo.save(settings);
    this.emitUpdated(saved.siteId, 'contact');
    return saved;
  }

  async updateSocial(dto: UpdateSocialLinksDto): Promise<SiteSettings> {
    const settings = await this.get();
    settings.socialLinks = dto.socialLinks;

    const saved = await this.settingsRepo.save(settings);
    this.emitUpdated(saved.siteId, 'social');
    return saved;
  }

  async updateSeo(dto: SeoMetadataDto): Promise<SiteSettings> {
    const settings = await this.get();
    settings.defaultSeo = { ...settings.defaultSeo, ...dto };

    const saved = await this.settingsRepo.save(settings);
    this.emitUpdated(saved.siteId, 'seo');
    return saved;
  }

  async updateFeatureFlags(dto: UpdateFeatureFlagsDto): Promise<SiteSettings> {
    const settings = await this.get();
    settings.featureFlags = { ...settings.featureFlags, ...dto };

    const saved = await this.settingsRepo.save(settings);
    this.emitUpdated(saved.siteId, 'feature_flags');
    return saved;
  }
}
