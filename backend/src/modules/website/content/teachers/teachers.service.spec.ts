import { ConflictException } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

describe('TeachersService', () => {
  const siteId = 'site-1';
  let repo: any;
  let siteService: any;
  let ordering: any;
  let publishing: any;
  let media: any;
  let sitemap: any;
  let revisions: any;
  let service: TeachersService;

  beforeEach(() => {
    repo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'teacher-1', ...data })),
      findOneByOrFail: jest.fn(),
      delete: jest.fn(),
      manager: {},
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getRawOne: jest.fn().mockResolvedValue({ max: null }),
      }),
    };
    siteService = { getDefaultSiteId: jest.fn().mockReturnValue(siteId) };
    ordering = { reorder: jest.fn() };
    publishing = { transition: jest.fn() };
    media = { attach: jest.fn(), detach: jest.fn() };
    sitemap = { register: jest.fn() };
    revisions = {
      record: jest.fn(),
      list: jest.fn(),
      getVersion: jest.fn(),
    };
    service = new TeachersService(
      repo,
      siteService,
      ordering,
      publishing,
      media,
      sitemap,
      revisions,
    );
  });

  describe('onModuleInit', () => {
    it('registers a sitemap provider', () => {
      service.onModuleInit();
      expect(sitemap.register).toHaveBeenCalledWith(expect.any(Function));
    });

    it('withholds a published teacher whose publishAt is still in the future', async () => {
      const future = new Date(Date.now() + 86_400_000);
      jest.spyOn(service, 'findAll').mockResolvedValue([
        {
          id: 't1',
          slug: 'future-teacher',
          publishAt: future,
          updatedAt: new Date(),
        } as any,
      ]);

      service.onModuleInit();
      const provider = sitemap.register.mock.calls[0][0];
      const entries = await provider();

      expect(entries).toEqual([]);
    });

    it('includes a published teacher once publishAt has passed', async () => {
      const past = new Date(Date.now() - 86_400_000);
      jest.spyOn(service, 'findAll').mockResolvedValue([
        { id: 't1', slug: 'past-teacher', publishAt: past, updatedAt: past } as any,
      ]);

      service.onModuleInit();
      const provider = sitemap.register.mock.calls[0][0];
      const entries = await provider();

      expect(entries).toEqual([{ loc: '/teachers/past-teacher', lastmod: past }]);
    });
  });

  describe('create', () => {
    it('creates a teacher as DRAFT, appends it to the end of the order, and attaches the avatar', async () => {
      repo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: 2 }),
      });

      const teacher = await service.create(
        {
          fullName: 'Jane Smith',
          slug: 'jane-smith',
          jobTitle: { fa: 'دبیر ریاضی' },
          bio: { fa: 'توضیحات' },
          avatarMediaId: 'media-1',
        },
        'author-1',
      );

      expect(teacher.status).toBe(PublishStatus.DRAFT);
      expect(teacher.siteId).toBe(siteId);
      expect(teacher.position).toBe(3);
      expect(media.attach).toHaveBeenCalledWith('media-1', 'teacher', 'teacher-1');
      expect(revisions.record).toHaveBeenCalledWith(
        'teacher',
        'teacher-1',
        expect.objectContaining({ slug: 'jane-smith' }),
        'author-1',
      );
    });

    it('defaults position to 0 for the first teacher on a site', async () => {
      const teacher = await service.create(
        {
          fullName: 'Jane Smith',
          slug: 'first-teacher',
          jobTitle: { fa: 'دبیر ریاضی' },
          bio: { fa: 'توضیحات' },
        },
        'author-1',
      );

      expect(teacher.position).toBe(0);
    });

    it('rejects a slug already used on this site', async () => {
      repo.findOne.mockResolvedValue({ id: 'other-teacher' });

      await expect(
        service.create(
          {
            fullName: 'Jane Smith',
            slug: 'taken-slug',
            jobTitle: { fa: 'دبیر ریاضی' },
            bio: { fa: 'توضیحات' },
          },
          'author-1',
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('update', () => {
    it('re-checks slug uniqueness only when the slug actually changes', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'teacher-1',
        siteId,
        slug: 'old-slug',
        status: PublishStatus.DRAFT,
      });

      await service.update('teacher-1', { phone: '555-0100' }, 'author-1');

      expect(repo.findOne).not.toHaveBeenCalled();
    });

    it('rejects renaming to a slug already used by another teacher', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'teacher-1',
        siteId,
        slug: 'old-slug',
        status: PublishStatus.DRAFT,
      });
      repo.findOne.mockResolvedValue({ id: 'other-teacher' });

      await expect(
        service.update('teacher-1', { slug: 'taken-slug' }, 'author-1'),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('detaches the old avatar and attaches the new one when it changes', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'teacher-1',
        siteId,
        slug: 'old-slug',
        avatarMediaId: 'media-old',
        status: PublishStatus.DRAFT,
      });

      await service.update('teacher-1', { avatarMediaId: 'media-new' }, 'author-1');

      expect(media.detach).toHaveBeenCalledWith('media-old', 'teacher', 'teacher-1');
      expect(media.attach).toHaveBeenCalledWith('media-new', 'teacher', 'teacher-1');
    });

    it('clears campusId/phone/email when explicitly set to null', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'teacher-1',
        siteId,
        slug: 'old-slug',
        campusId: 'campus-1',
        phone: '555-0100',
        email: 'old@example.com',
        status: PublishStatus.DRAFT,
      });

      const result = await service.update(
        'teacher-1',
        { campusId: null, phone: null, email: null },
        'author-1',
      );

      expect(result.campusId).toBeUndefined();
      expect(result.phone).toBeUndefined();
      expect(result.email).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('detaches the avatar before deleting', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'teacher-1',
        siteId,
        avatarMediaId: 'media-1',
      });

      await service.remove('teacher-1');

      expect(media.detach).toHaveBeenCalledWith('media-1', 'teacher', 'teacher-1');
      expect(repo.delete).toHaveBeenCalledWith({ id: 'teacher-1' });
    });
  });

  describe('updateStatus', () => {
    it('delegates transition validation to PublishingService', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'teacher-1',
        siteId,
        status: PublishStatus.DRAFT,
      });

      const result = await service.updateStatus('teacher-1', PublishStatus.PUBLISHED);

      expect(publishing.transition).toHaveBeenCalledWith({
        from: PublishStatus.DRAFT,
        to: PublishStatus.PUBLISHED,
        entityType: 'teacher',
        entityId: 'teacher-1',
        siteId,
      });
      expect(result.status).toBe(PublishStatus.PUBLISHED);
    });
  });

  describe('schedule', () => {
    it('sets a future publishAt', async () => {
      repo.findOneByOrFail.mockResolvedValue({ id: 'teacher-1', siteId });

      const isoDate = '2027-01-01T00:00:00.000Z';
      const result = await service.schedule('teacher-1', isoDate);

      expect(result.publishAt).toEqual(new Date(isoDate));
    });

    it('clears the schedule when publishAt is null', async () => {
      repo.findOneByOrFail.mockResolvedValue({
        id: 'teacher-1',
        siteId,
        publishAt: new Date(),
      });

      const result = await service.schedule('teacher-1', null);

      expect(result.publishAt).toBeUndefined();
    });
  });

  describe('reorder', () => {
    it('delegates to OrderingService against the teachers table', async () => {
      await service.reorder(['t1', 't2', 't3']);

      expect(ordering.reorder).toHaveBeenCalledWith(
        repo.manager,
        'teachers',
        ['t1', 't2', 't3'],
      );
    });
  });
});
