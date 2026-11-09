import { SyncSiteContentFields1794140000000 } from './1794140000000-SyncSiteContentFields';

describe('SyncSiteContentFields1794140000000', () => {
  const migration = new SyncSiteContentFields1794140000000();

  it('runs reversible schema operations in safe order', async () => {
    const queries: string[] = [];
    const queryRunner = {
      query: jest.fn(async (sql: string) => {
        queries.push(sql);
      }),
    };

    await migration.up(queryRunner as never);
    expect(queries).toHaveLength(6);
    expect(queries[0]).toContain('ADD "mapLatitude"');
    expect(queries[2]).toContain('ADD "isFeatured"');

    queries.length = 0;
    await migration.down(queryRunner as never);
    expect(queries).toHaveLength(6);
    expect(queries[0]).toContain('DROP INDEX "IDX_testimonials_isFeatured"');
    expect(queries[5]).toContain('DROP COLUMN "mapLatitude"');
  });
});
