import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the Pre-Registration submissions table
 * (`content/pre-registrations/entities/pre-registration.entity.ts`).
 *
 * This table was missed by every earlier migration: it was created
 * locally by `DATABASE_SYNCHRONIZE=true`, so its absence only shows up
 * in a production/migrations-only environment — where `POST
 * /public/pre-registration` would 500 (no `pre_registrations` table to
 * insert into). Written by hand to match what synchronize generated,
 * same convention as the other content-table migrations.
 *
 * Structural/list content, not publish- or revision-tracked — a
 * submission is triaged (status) or deleted, never drafted/published.
 * Fields are plain (non-translatable) columns: this is visitor-submitted
 * data, not CMS-authored multi-locale content.
 */
export class AddPreRegistrations1784930000000 implements MigrationInterface {
  name = 'AddPreRegistrations1784930000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "pre_registrations_status_enum" AS ENUM ('new', 'contacted', 'archived')
    `);

    await queryRunner.query(`
      CREATE TABLE "pre_registrations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "siteId" uuid NOT NULL,
        "studentFirstName" character varying NOT NULL,
        "studentLastName" character varying NOT NULL,
        "studentNationalId" character varying NOT NULL,
        "studentBirthDate" date NOT NULL,
        "studentGrade" character varying NOT NULL,
        "guardianFullName" character varying NOT NULL,
        "guardianPhone" character varying NOT NULL,
        "guardianEmail" character varying,
        "notes" text,
        "status" "pre_registrations_status_enum" NOT NULL DEFAULT 'new',
        CONSTRAINT "PK_pre_registrations" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_pre_registrations_siteId" ON "pre_registrations" ("siteId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_pre_registrations_status" ON "pre_registrations" ("status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "pre_registrations"`);
    await queryRunner.query(`DROP TYPE "pre_registrations_status_enum"`);
  }
}
