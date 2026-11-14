import { FixTextbookColumnNames1794220000000 } from './1794220000000-FixTextbookColumnNames';

describe('FixTextbookColumnNames1794220000000', () => {
  it('renames textbook columns to match entity metadata', async () => {
    const tables = new Map([
      ['textbooks', new Set(['site_id', 'created_at', 'academic_year'])],
      ['textbook_taxonomies', new Set(['sort_order'])],
    ]);
    const queryRunner = {
      hasTable: jest.fn(async (table: string) => tables.has(table)),
      hasColumn: jest.fn(
        async (table: string, column: string) =>
          tables.get(table)?.has(column) ?? false,
      ),
      renameColumn: jest.fn(
        async (table: string, oldName: string, newName: string) => {
          const columns = tables.get(table)!;
          columns.delete(oldName);
          columns.add(newName);
        },
      ),
    };

    await new FixTextbookColumnNames1794220000000().up(queryRunner as any);

    expect(queryRunner.renameColumn).toHaveBeenCalledWith(
      'textbooks',
      'site_id',
      'siteId',
    );
    expect(queryRunner.renameColumn).toHaveBeenCalledWith(
      'textbooks',
      'created_at',
      'createdAt',
    );
    expect(queryRunner.renameColumn).toHaveBeenCalledWith(
      'textbooks',
      'academic_year',
      'academicYear',
    );
    expect(queryRunner.renameColumn).toHaveBeenCalledWith(
      'textbook_taxonomies',
      'sort_order',
      'sortOrder',
    );
  });
});
