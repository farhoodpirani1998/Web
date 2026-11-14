import { FixEmbeddedColumnNames1794210000000 } from './1794210000000-FixEmbeddedColumnNames';

describe('FixEmbeddedColumnNames1794210000000', () => {
  it('renames legacy embedded columns only when the entity column is absent', async () => {
    const columns = new Map([
      ['about_page', new Set(['seoMetaTitle'])],
      [
        'site_settings',
        new Set(['featureFlagsNewsEnabled', 'featureFlagsNewsenabled']),
      ],
    ]);
    const queryRunner = {
      hasTable: jest.fn().mockResolvedValue(true),
      hasColumn: jest.fn(
        async (table: string, column: string) =>
          columns.get(table)?.has(column) ?? false,
      ),
      renameColumn: jest.fn(
        async (table: string, oldName: string, newName: string) => {
          const tableColumns = columns.get(table)!;
          tableColumns.delete(oldName);
          tableColumns.add(newName);
        },
      ),
    };

    await new FixEmbeddedColumnNames1794210000000().up(queryRunner as any);

    expect(queryRunner.renameColumn).toHaveBeenCalledWith(
      'about_page',
      'seoMetaTitle',
      'seoMetatitle',
    );
    expect(queryRunner.renameColumn).not.toHaveBeenCalledWith(
      'site_settings',
      'featureFlagsNewsEnabled',
      'featureFlagsNewsenabled',
    );
  });

  it('restores legacy names when reverting', async () => {
    const columns = new Map([['about_page', new Set(['seoMetatitle'])]]);
    const queryRunner = {
      hasTable: jest.fn().mockResolvedValue(true),
      hasColumn: jest.fn(
        async (table: string, column: string) =>
          columns.get(table)?.has(column) ?? false,
      ),
      renameColumn: jest.fn(
        async (table: string, oldName: string, newName: string) => {
          const tableColumns = columns.get(table)!;
          tableColumns.delete(oldName);
          tableColumns.add(newName);
        },
      ),
    };

    await new FixEmbeddedColumnNames1794210000000().down(queryRunner as any);

    expect(queryRunner.renameColumn).toHaveBeenCalledWith(
      'about_page',
      'seoMetatitle',
      'seoMetaTitle',
    );
  });
});
