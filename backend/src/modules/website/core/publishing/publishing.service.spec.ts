import { BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PublishingService } from './publishing.service';
import { PublishStatus } from './publish-status.enum';
import { WEBSITE_EVENTS } from '../events/events.constants';

describe('PublishingService', () => {
  let events: { emit: jest.Mock };
  let service: PublishingService;

  beforeEach(() => {
    events = { emit: jest.fn() };
    service = new PublishingService(events as unknown as EventEmitter2);
  });

  describe('assertValidTransition', () => {
    it('allows draft -> published', () => {
      expect(() =>
        service.assertValidTransition(PublishStatus.DRAFT, PublishStatus.PUBLISHED),
      ).not.toThrow();
    });

    it('allows published -> archived', () => {
      expect(() =>
        service.assertValidTransition(PublishStatus.PUBLISHED, PublishStatus.ARCHIVED),
      ).not.toThrow();
    });

    it('allows archived -> draft', () => {
      expect(() =>
        service.assertValidTransition(PublishStatus.ARCHIVED, PublishStatus.DRAFT),
      ).not.toThrow();
    });

    it('rejects archived -> published (must go through draft first)', () => {
      expect(() =>
        service.assertValidTransition(PublishStatus.ARCHIVED, PublishStatus.PUBLISHED),
      ).toThrow(BadRequestException);
    });

    it('rejects a status transitioning to itself', () => {
      expect(() =>
        service.assertValidTransition(PublishStatus.DRAFT, PublishStatus.DRAFT),
      ).toThrow(BadRequestException);
    });
  });

  describe('transition', () => {
    const base = {
      entityType: 'news_article',
      entityId: 'entity-1',
      siteId: 'site-1',
    };

    it('emits CONTENT_UPDATED but not CONTENT_PUBLISHED for a non-publish transition', () => {
      service.transition({ ...base, from: PublishStatus.DRAFT, to: PublishStatus.ARCHIVED });

      expect(events.emit).toHaveBeenCalledTimes(1);
      expect(events.emit).toHaveBeenCalledWith(
        WEBSITE_EVENTS.CONTENT_UPDATED,
        expect.objectContaining(base),
      );
    });

    it('emits both CONTENT_UPDATED and CONTENT_PUBLISHED when transitioning to PUBLISHED', () => {
      service.transition({ ...base, from: PublishStatus.DRAFT, to: PublishStatus.PUBLISHED });

      expect(events.emit).toHaveBeenCalledTimes(2);
      expect(events.emit).toHaveBeenNthCalledWith(
        1,
        WEBSITE_EVENTS.CONTENT_UPDATED,
        expect.objectContaining(base),
      );
      expect(events.emit).toHaveBeenNthCalledWith(
        2,
        WEBSITE_EVENTS.CONTENT_PUBLISHED,
        expect.objectContaining({ ...base, publishedAt: expect.any(Date) }),
      );
    });

    it('throws and emits nothing for an invalid transition', () => {
      expect(() =>
        service.transition({ ...base, from: PublishStatus.ARCHIVED, to: PublishStatus.PUBLISHED }),
      ).toThrow(BadRequestException);
      expect(events.emit).not.toHaveBeenCalled();
    });
  });
});
