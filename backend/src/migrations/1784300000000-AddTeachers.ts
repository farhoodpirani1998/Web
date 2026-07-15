import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the Teachers CMS module: the `teachers` table — the same
 * "indexable public page" shape as `campuses` (slug/excerpt/seo columns/
 * publishAt/status/position) plus the fields a teacher profile actually
 * needs beyond a campus: `fullName` (proper noun, plain varchar — not
 * jsonb, unlike the translatable prose columns), `jobTitle`/`department`
 * (translatable prose), `campusId` (optional reference to the campus
 * this teacher is based at), and `avatarMediaId` (Media reference,
 * named for what it is here — a headshot — same convention as
 * `campuses.featuredImageMediaId`).
 *
 * Like AddCampuses, this migration does NOT touch `site_settings` —
 * Teachers is core content, not feature-flag gated (see the Teacher
 * entity's doc comment), so there is no `featureFlagsTeachersEnabled`
 * column to add.
 *
 * Written by hand against the entity definitions, same convention as
 * InitSchema/AddCalendarEvents/AddCampuses — no foreign-key constraints
 * (siteId, campusId, avatarMediaId are plain uuid columns validated at
 * the service layer, not TypeORM relations), consistent with every
 * other table in this schema.
 */
export class AddTeachers1784300000000 implements MigrationInterface {
  name = 'AddTeachers1784300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "teachers_status_enum" AS ENUM ('draft', 'published', 'archived')
    `);

    await queryRunner.query(`
      CREATE TABLE "teachers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "siteId" uuid NOT NULL,
        "fullName" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "jobTitle" jsonb NOT NULL,
        "excerpt" jsonb,
        "bio" jsonb NOT NULL,
        "department" jsonb,
        "campusId" uuid,
        "phone" character varying,
        "email" character varying,
        "position" integer NOT NULL DEFAULT 0,
        "avatarMediaId" uuid,
        "seoMetaTitle" character varying,
        "seoMetaDescription" text,
        "seoOgImageUrl" character varying,
        "seoCanonicalUrl" character varying,
        "seoNoindex" boolean NOT NULL DEFAULT false,
        "publishAt" TIMESTAMP WITH TIME ZONE,
        "status" "teachers_status_enum" NOT NULL DEFAULT 'draft',
        CONSTRAINT "PK_teachers" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_teachers_siteId" ON "teachers" ("siteId")`);
    await queryRunner.query(`CREATE INDEX "IDX_teachers_position" ON "teachers" ("position")`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_teachers_siteId_slug" ON "teachers" ("siteId", "slug")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "teachers"`);
    await queryRunner.query(`DROP TYPE "teachers_status_enum"`);
  }
}
