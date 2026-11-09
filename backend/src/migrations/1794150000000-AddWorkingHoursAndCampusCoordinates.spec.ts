import { AddWorkingHoursAndCampusCoordinates1794150000000 } from './1794150000000-AddWorkingHoursAndCampusCoordinates';

describe('AddWorkingHoursAndCampusCoordinates1794150000000', () => {
  const migration = new AddWorkingHoursAndCampusCoordinates1794150000000();

  it('adds optional fields and drops them in reverse order', async () => {
    const queries: string[] = [];
    const queryRunner = {
      query: jest.fn(async (sql: string) => {
        queries.push(sql);
      }),
    };

    await migration.up(queryRunner as never);
    expect(queries).toHaveLength(3);
    expect(queries[0]).toContain('"workingHours" jsonb');
    expect(queries[1]).toContain('"latitude" double precision');
    expect(queries[2]).toContain('"longitude" double precision');

    queries.length = 0;
    await migration.down(queryRunner as never);
    expect(queries).toHaveLength(3);
    expect(queries[0]).toContain('DROP COLUMN "longitude"');
    expect(queries[2]).toContain('DROP COLUMN "workingHours"');
  });
});
