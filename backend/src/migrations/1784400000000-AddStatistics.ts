import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the Statistics CMS module: the `statistics` table — the same
 * structural/list-content shape as `features` (translatable `label`,
 * `icon` design-token string, `position`, `status`), plus the two
 * fields a stat counter actually needs beyond a feature card: `value`
 * (the numeric part a counter animates towards) and `suffix` (a
 * trailing unit/decoration such as "+", "%", "K" — see the entity's
 * doc comment for why these are split rather than one formatted
 * string).
 *
 * Like AddCampuses/AddTeachers, this migration does NOT touch
 * `site_settings` — Statistics is not feature-flag gated (no
 * `featureFlagsStatisticsEnabled` column), same reasoning Features
 * itself already sets: it's a core section, not an optional widget.
 * It also does NOT touch `content_revisions`/its enabled-types list —
 * unlike Campuses/Teachers, a statistic has no long-form prose field,
 * so it is not one of the revision-enabled types (see the entity's doc
 * comment and RevisionsService.REVISION_ENABLED_TYPES).
 *
 * Written by hand against the entity definitions, same convention as
 * InitSchema/AddCampuses/AddTeachers — no foreign-key constraints
 * (siteId is a plain uuid column validated at the service layer, not a
 * TypeORM relation), consistent with every other table in this schema.
 */
export class AddStatistics1784400000000 implements MigrationInterface {
  name = 'AddStatistics1784400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "statistics_status_enum" AS ENUM ('draft', 'published', 'archived')
    `);

    await queryRunner.query(`
      CREATE TABLE "statistics" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "siteId" uuid NOT NULL,
        "label" jsonb NOT NULL,
        "value" double precision NOT NULL,
        "suffix" character varying,
        "icon" character varying,
        "position" integer NOT NULL DEFAULT 0,
        "status" "statistics_status_enum" NOT NULL DEFAULT 'draft',
        CONSTRAINT "PK_statistics" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_statistics_siteId" ON "statistics" ("siteId")`);
    await queryRunner.query(`CREATE INDEX "IDX_statistics_position" ON "statistics" ("position")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "statistics"`);
    await queryRunner.query(`DROP TYPE "statistics_status_enum"`);
  }
}
