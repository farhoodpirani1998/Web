import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCampusScopedContent1794160002000 implements MigrationInterface {
  name = 'AddCampusScopedContent1794160002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "campuses" ADD COLUMN IF NOT EXISTS "gradeLevels" text[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "news_articles" ADD COLUMN IF NOT EXISTS "campusId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" ADD COLUMN IF NOT EXISTS "campusId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "admission_entries" ADD COLUMN IF NOT EXISTS "campusId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "pre_registrations" ADD COLUMN IF NOT EXISTS "campusId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "pre_registrations" ADD COLUMN IF NOT EXISTS "assignedAdminId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "pre_registrations" ADD COLUMN IF NOT EXISTS "followUpAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_news_articles_campusId" ON "news_articles" ("campusId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_calendar_events_campusId" ON "calendar_events" ("campusId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_admission_entries_campusId" ON "admission_entries" ("campusId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_teachers_campusId" ON "teachers" ("campusId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_pre_registrations_campusId" ON "pre_registrations" ("campusId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_pre_registrations_assignedAdminId" ON "pre_registrations" ("assignedAdminId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_pre_registrations_assignedAdminId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_pre_registrations_campusId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_admission_entries_campusId"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_teachers_campusId"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_calendar_events_campusId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_news_articles_campusId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pre_registrations" DROP COLUMN IF EXISTS "followUpAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pre_registrations" DROP COLUMN IF EXISTS "assignedAdminId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pre_registrations" DROP COLUMN IF EXISTS "campusId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "admission_entries" DROP COLUMN IF EXISTS "campusId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" DROP COLUMN IF EXISTS "campusId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "news_articles" DROP COLUMN IF EXISTS "campusId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "campuses" DROP COLUMN IF EXISTS "gradeLevels"`,
    );
  }
}
