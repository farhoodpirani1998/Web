import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Closes the "site content gap" fields — site-visible data that the
 * public components render but the CMS had no column for, so seeding
 * from the existing placeholders wouldn't silently lose them:
 *
 * - `campuses.area` (jsonb, translatable) + `campuses.features` (text[])
 * - `teachers.specialties` (text[])
 * - `gallery_items.description` (jsonb, translatable)
 *
 * (`news_articles.body` already existed; this migration does not touch
 * News — the gap there was the public list DTO not selecting `body`,
 * a controller change, not a schema one.)
 *
 * Written by hand against the entity definitions, same convention as
 * AddCampuses/AddTeachers — plain `ALTER TABLE ADD COLUMN`, no
 * foreign-key constraints. All four columns are nullable, so this is
 * safe to run against a populated table.
 */
export class AddSiteContentGaps1784900000000 implements MigrationInterface {
  name = 'AddSiteContentGaps1784900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "campuses" ADD "area" jsonb`);
    await queryRunner.query(`ALTER TABLE "campuses" ADD "features" text array`);
    await queryRunner.query(
      `ALTER TABLE "teachers" ADD "specialties" text array`,
    );
    await queryRunner.query(
      `ALTER TABLE "gallery_items" ADD "description" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gallery_items" DROP COLUMN "description"`,
    );
    await queryRunner.query(`ALTER TABLE "teachers" DROP COLUMN "specialties"`);
    await queryRunner.query(`ALTER TABLE "campuses" DROP COLUMN "features"`);
    await queryRunner.query(`ALTER TABLE "campuses" DROP COLUMN "area"`);
  }
}
