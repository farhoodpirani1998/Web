import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds two CMS modules, both modeled as a single table with a `kind`
 * discriminator (their sections share one shape family):
 *
 * - `academic_calendar_entries` — kind ∈ {year_stat, term, holiday,
 *   exam_period, important_date}
 * - `admission_entries` — kind ∈ {step, requirement, required_document,
 *   tuition_plan}
 *
 * Structural/list content (like FAQ/Achievements): no media, no SEO, no
 * revisions. Written by hand against the entity definitions, same
 * convention as the other content-table migrations.
 */
export class AddAcademicCalendarAndAdmissions1784920000000 implements MigrationInterface {
  name = 'AddAcademicCalendarAndAdmissions1784920000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "academic_calendar_entries_kind_enum" AS ENUM
        ('year_stat', 'term', 'holiday', 'exam_period', 'important_date')
    `);
    await queryRunner.query(`
      CREATE TYPE "academic_calendar_entries_status_enum" AS ENUM ('draft', 'published', 'archived')
    `);
    await queryRunner.query(`
      CREATE TABLE "academic_calendar_entries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "siteId" uuid NOT NULL,
        "kind" "academic_calendar_entries_kind_enum" NOT NULL,
        "title" jsonb NOT NULL,
        "value" character varying,
        "dateRange" character varying,
        "date" character varying,
        "description" jsonb,
        "position" integer NOT NULL DEFAULT 0,
        "status" "academic_calendar_entries_status_enum" NOT NULL DEFAULT 'draft',
        CONSTRAINT "PK_academic_calendar_entries" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_academic_calendar_entries_siteId" ON "academic_calendar_entries" ("siteId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_academic_calendar_entries_kind" ON "academic_calendar_entries" ("kind")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_academic_calendar_entries_position" ON "academic_calendar_entries" ("position")`,
    );

    await queryRunner.query(`
      CREATE TYPE "admission_entries_kind_enum" AS ENUM
        ('step', 'requirement', 'required_document', 'tuition_plan')
    `);
    await queryRunner.query(`
      CREATE TYPE "admission_entries_status_enum" AS ENUM ('draft', 'published', 'archived')
    `);
    await queryRunner.query(`
      CREATE TABLE "admission_entries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "siteId" uuid NOT NULL,
        "kind" "admission_entries_kind_enum" NOT NULL,
        "title" jsonb NOT NULL,
        "value" character varying,
        "description" jsonb,
        "price" character varying,
        "period" character varying,
        "includes" text array,
        "position" integer NOT NULL DEFAULT 0,
        "status" "admission_entries_status_enum" NOT NULL DEFAULT 'draft',
        CONSTRAINT "PK_admission_entries" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_admission_entries_siteId" ON "admission_entries" ("siteId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_admission_entries_kind" ON "admission_entries" ("kind")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_admission_entries_position" ON "admission_entries" ("position")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "admission_entries"`);
    await queryRunner.query(`DROP TYPE "admission_entries_status_enum"`);
    await queryRunner.query(`DROP TYPE "admission_entries_kind_enum"`);
    await queryRunner.query(`DROP TABLE "academic_calendar_entries"`);
    await queryRunner.query(
      `DROP TYPE "academic_calendar_entries_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE "academic_calendar_entries_kind_enum"`);
  }
}
