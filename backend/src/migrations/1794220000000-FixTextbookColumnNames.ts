import { MigrationInterface, QueryRunner } from 'typeorm';

const TABLE_COLUMNS: Array<{
  table: string;
  columns: Array<[string, string]>;
}> = [
  {
    table: 'textbooks',
    columns: [
      ['site_id', 'siteId'],
      ['created_at', 'createdAt'],
      ['updated_at', 'updatedAt'],
      ['academic_year', 'academicYear'],
      ['page_count', 'pageCount'],
      ['file_size', 'fileSize'],
      ['cover_key', 'coverKey'],
      ['file_key', 'fileKey'],
      ['source_type', 'sourceType'],
      ['external_url', 'externalUrl'],
      ['source_attribution', 'sourceAttribution'],
      ['license_note', 'licenseNote'],
      ['sort_order', 'sortOrder'],
      ['download_count', 'downloadCount'],
      ['deleted_at', 'deletedAt'],
    ],
  },
  {
    table: 'textbook_taxonomies',
    columns: [
      ['site_id', 'siteId'],
      ['created_at', 'createdAt'],
      ['updated_at', 'updatedAt'],
      ['sort_order', 'sortOrder'],
    ],
  },
  {
    table: 'textbook_download_logs',
    columns: [
      ['created_at', 'createdAt'],
      ['updated_at', 'updatedAt'],
      ['textbook_id', 'textbookId'],
      ['requester_hash', 'requesterHash'],
    ],
  },
  {
    table: 'textbook_audit_logs',
    columns: [
      ['created_at', 'createdAt'],
      ['updated_at', 'updatedAt'],
      ['textbook_id', 'textbookId'],
      ['actor_id', 'actorId'],
    ],
  },
];

export class FixTextbookColumnNames1794220000000 implements MigrationInterface {
  name = 'FixTextbookColumnNames1794220000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    for (const { table, columns } of TABLE_COLUMNS) {
      if (!(await queryRunner.hasTable(table))) continue;

      for (const [legacyName, entityName] of columns) {
        if (
          (await queryRunner.hasColumn(table, legacyName)) &&
          !(await queryRunner.hasColumn(table, entityName))
        ) {
          await queryRunner.renameColumn(table, legacyName, entityName);
        }
      }
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    for (const { table, columns } of [...TABLE_COLUMNS].reverse()) {
      if (!(await queryRunner.hasTable(table))) continue;

      for (const [legacyName, entityName] of [...columns].reverse()) {
        if (
          (await queryRunner.hasColumn(table, entityName)) &&
          !(await queryRunner.hasColumn(table, legacyName))
        ) {
          await queryRunner.renameColumn(table, entityName, legacyName);
        }
      }
    }
  }
}
