import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the Achievements CMS module: the `achievements` table — the same
 * structural/list shape as `faqs`/`testimonials` (title-ish display
 * value, position, status), plus a translatable `label` and an optional
 * `icon` key (same convention as `features.icon`).
 *
 * Written by hand against the entity definition, same convention as
 * AddCampuses/AddFaqs — no foreign-key constraints (siteId is a plain
 * uuid validated at the service layer), consistent with every other
 * table in this schema.
 */
export class AddAchievements1784910000000 implements MigrationInterface {
  name = 'AddAchievements1784910000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "achievements_status_enum" AS ENUM ('draft', 'published', 'archived')
    `);

    await queryRunner.query(`
      CREATE TABLE "achievements" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "siteId" uuid NOT NULL,
        "value" character varying NOT NULL,
        "label" jsonb NOT NULL,
        "icon" character varying,
        "position" integer NOT NULL DEFAULT 0,
        "status" "achievements_status_enum" NOT NULL DEFAULT 'draft',
        CONSTRAINT "PK_achievements" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_achievements_siteId" ON "achievements" ("siteId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_achievements_position" ON "achievements" ("position")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "achievements"`);
    await queryRunner.query(`DROP TYPE "achievements_status_enum"`);
  }
}
