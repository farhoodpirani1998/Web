import { ContentRevision } from './entities/content-revision.entity';
import { RevisionsService } from './revisions.service';

describe('RevisionsService', () => {
  it('allocates revision numbers under a transaction-scoped entity lock', async () => {
    const revisionRepo = {
      findOne: jest.fn().mockResolvedValue({ versionNumber: 3 }),
      create: jest.fn((revision) => revision),
      save: jest.fn((revision) => Promise.resolve(revision)),
    };
    const manager = {
      query: jest.fn().mockResolvedValue(undefined),
      getRepository: jest.fn().mockReturnValue(revisionRepo),
    };
    const repo = {
      manager: {
        transaction: jest.fn((operation) => operation(manager)),
      },
    };
    const service = new RevisionsService(repo as any);

    const revision = await service.record(
      'calendar_event',
      'event-1',
      { title: 'Updated' },
      'author-1',
    );

    expect(repo.manager.transaction).toHaveBeenCalledTimes(1);
    expect(manager.query).toHaveBeenCalledWith(
      'SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))',
      ['calendar_event', 'event-1'],
    );
    expect(manager.getRepository).toHaveBeenCalledWith(ContentRevision);
    expect(revisionRepo.findOne).toHaveBeenCalledWith({
      where: { entityType: 'calendar_event', entityId: 'event-1' },
      order: { versionNumber: 'DESC' },
    });
    expect(revision.versionNumber).toBe(4);
  });
});
