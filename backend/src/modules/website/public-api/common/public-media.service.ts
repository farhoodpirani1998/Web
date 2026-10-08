import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Media } from '../../core/media/entities/media.entity';

export interface PublicMediaRef {
  url: string;
  thumbnailUrl?: string;
  cardUrl?: string;
  altText: string;
}

/**
 * Read-only resolution of mediaId -> the subset of Media fields the
 * public site needs (never storageKey/sizeBytes/status/siteId). Lives
 * in public-api rather than core/media because it's a public-read
 * concern, same reasoning NewsService's class comment gives for
 * keeping the public read path out of the admin/core layers —
 * MediaService itself stays upload/attach/detach/purge only.
 */
@Injectable()
export class PublicMediaService {
  constructor(
    @InjectRepository(Media) private readonly mediaRepo: Repository<Media>,
  ) {}

  async resolveOne(mediaId?: string | null): Promise<PublicMediaRef | null> {
    if (!mediaId) return null;
    const media = await this.mediaRepo.findOne({ where: { id: mediaId } });
    return media ? this.toRef(media) : null;
  }

  /** Batched lookup for list endpoints — one query instead of N. */
  async resolveMany(
    mediaIds: Array<string | undefined>,
  ): Promise<Map<string, PublicMediaRef>> {
    const ids = [...new Set(mediaIds.filter((id): id is string => !!id))];
    if (ids.length === 0) return new Map();
    const rows = await this.mediaRepo.find({ where: { id: In(ids) } });
    return new Map(rows.map((media) => [media.id, this.toRef(media)]));
  }

  private toRef(media: Media): PublicMediaRef {
    return {
      url: media.url,
      thumbnailUrl: media.thumbnailUrl,
      cardUrl: media.cardUrl,
      altText: media.altText,
    };
  }
}
