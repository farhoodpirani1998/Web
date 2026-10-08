import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the Campuses CMS module: the `campuses` table — the same
 * "indexable public page" shape as `calendar_events`/`news_articles`
 * (title/slug/excerpt/body/featuredImageMediaId/seo columns/publishAt/
 * status) plus `address`/`mapUrl`/`phone`/`email` (the same contact
 * shape `site_settings` already has, scoped to one campus) and
 * `position` (manual admin ordering — the same column `features` and
 * `testimonials` already use).
 *
 * Unlike AddCalendarEvents, this migration does NOT touch
 * `site_settings` — Campuses is core content, not feature-flag gated
 * (see the Campus entity's doc comment), so there is no
 * `featureFlagsCampusesEnabled` column to add.
 *
 * Written by hand against the entity definitions, same convention as
 * InitSchema/AddCalendarEvents — no foreign-key constraints (siteId,
 * featuredImageMediaId are plain uuid columns validated at the service
 * layer, not TypeORM relations), consistent with every other table in
 * this schema.
 */
export class AddCampuses1784200000000 implements MigrationInterface {
  name = 'AddCampuses1784200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "campuses_status_enum" AS ENUM ('draft', 'published', 'archived')
    `);

    await queryRunner.query(`
      CREATE TABLE "campuses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "siteId" uuid NOT NULL,
        "title" jsonb NOT NULL,
        "slug" character varying NOT NULL,
        "excerpt" jsonb,
        "body" jsonb NOT NULL,
        "address" jsonb,
        "mapUrl" character varying,
        "phone" character varying,
        "email" character varying,
        "position" integer NOT NULL DEFAULT 0,
        "featuredImageMediaId" uuid,
        "seoMetaTitle" character varying,
        "seoMetaDescription" text,
        "seoOgImageUrl" character varying,
        "seoCanonicalUrl" character varying,
        "seoNoindex" boolean NOT NULL DEFAULT false,
        "publishAt" TIMESTAMP WITH TIME ZONE,
        "status" "campuses_status_enum" NOT NULL DEFAULT 'draft',
        CONSTRAINT "PK_campuses" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_campuses_siteId" ON "campuses" ("siteId")`);
    await queryRunner.query(`CREATE INDEX "IDX_campuses_position" ON "campuses" ("position")`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_campuses_siteId_slug" ON "campuses" ("siteId", "slug")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "campuses"`);
    await queryRunner.query(`DROP TYPE "campuses_status_enum"`);
  }
}
