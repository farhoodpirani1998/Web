import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the Events CMS module: the `calendar_events` table (same shape
 * as `news_articles`/`static_pages` plus `startAt`/`endAt`/`allDay`/
 * `location`/`locationUrl`) and the `featureFlagsEventsEnabled` column
 * on `site_settings` (see SiteFeatureFlags.eventsEnabled).
 *
 * Written by hand against the entity definitions, same convention as
 * InitSchema — no foreign-key constraints (siteId, featuredImageMediaId
 * are plain uuid columns validated at the service layer, not TypeORM
 * relations), consistent with every other table in this schema.
 */
export class AddCalendarEvents1784107548292 implements MigrationInterface {
  name = 'AddCalendarEvents1784107548292';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "calendar_events_status_enum" AS ENUM ('draft', 'published', 'archived')
    `);

    await queryRunner.query(`
      CREATE TABLE "calendar_events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "siteId" uuid NOT NULL,
        "title" jsonb NOT NULL,
        "slug" character varying NOT NULL,
        "excerpt" jsonb,
        "body" jsonb NOT NULL,
        "category" character varying,
        "tags" text array,
        "location" jsonb,
        "locationUrl" character varying,
        "startAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "endAt" TIMESTAMP WITH TIME ZONE,
        "allDay" boolean NOT NULL DEFAULT false,
        "featuredImageMediaId" uuid,
        "seoMetaTitle" character varying,
        "seoMetaDescription" text,
        "seoOgImageUrl" character varying,
        "seoCanonicalUrl" character varying,
        "seoNoindex" boolean NOT NULL DEFAULT false,
        "publishAt" TIMESTAMP WITH TIME ZONE,
        "status" "calendar_events_status_enum" NOT NULL DEFAULT 'draft',
        CONSTRAINT "PK_calendar_events" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_calendar_events_siteId" ON "calendar_events" ("siteId")`);
    await queryRunner.query(`CREATE INDEX "IDX_calendar_events_category" ON "calendar_events" ("category")`);
    await queryRunner.query(`CREATE INDEX "IDX_calendar_events_startAt" ON "calendar_events" ("startAt")`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_calendar_events_siteId_slug" ON "calendar_events" ("siteId", "slug")
    `);

    await queryRunner.query(`
      ALTER TABLE "site_settings"
      ADD COLUMN "featureFlagsEventsEnabled" boolean NOT NULL DEFAULT true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN "featureFlagsEventsEnabled"`);
    await queryRunner.query(`DROP TABLE "calendar_events"`);
    await queryRunner.query(`DROP TYPE "calendar_events_status_enum"`);
  }
}
