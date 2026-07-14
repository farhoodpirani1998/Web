import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial schema migration — creates every table currently backed by an
 * `@Entity` class, matching what `synchronize: true` was previously
 * generating on the fly in non-production environments.
 *
 * Written by hand against the entity definitions rather than produced by
 * `migration:generate`, because generating requires introspecting a live
 * Postgres database and none was reachable when this migration was authored.
 * Before relying on this in a real environment, run it against a disposable
 * database and confirm `migration:generate` afterwards reports no further
 * schema diff (see README "Migrations" section).
 *
 * No foreign-key constraints are created here: every cross-entity reference
 * in this codebase (siteId, *MediaId, parentId, pageId, menuId, etc.) is a
 * plain uuid column validated at the service layer, not a TypeORM relation —
 * this migration preserves that same convention at the DB layer.
 */
export class InitSchema1784049505842 implements MigrationInterface {
  name = 'InitSchema1784049505842';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // TypeORM's default uuid generation strategy for PrimaryGeneratedColumn('uuid').
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // --- Enum types -------------------------------------------------------
    await queryRunner.query(`
      CREATE TYPE "website_role_assignments_role_enum" AS ENUM (
        'website_super_admin', 'content_editor', 'publisher',
        'seo_marketing_manager', 'media_manager'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "media_status_enum" AS ENUM ('active', 'archived')
    `);
    await queryRunner.query(`
      CREATE TYPE "about_page_status_enum" AS ENUM ('draft', 'published', 'archived')
    `);
    await queryRunner.query(`
      CREATE TYPE "faqs_status_enum" AS ENUM ('draft', 'published', 'archived')
    `);
    await queryRunner.query(`
      CREATE TYPE "features_status_enum" AS ENUM ('draft', 'published', 'archived')
    `);
    await queryRunner.query(`
      CREATE TYPE "gallery_items_status_enum" AS ENUM ('draft', 'published', 'archived')
    `);
    await queryRunner.query(`
      CREATE TYPE "hero_slides_status_enum" AS ENUM ('draft', 'published', 'archived')
    `);
    await queryRunner.query(`
      CREATE TYPE "menu_items_linktype_enum" AS ENUM ('page', 'external')
    `);
    await queryRunner.query(`
      CREATE TYPE "news_articles_status_enum" AS ENUM ('draft', 'published', 'archived')
    `);
    await queryRunner.query(`
      CREATE TYPE "static_pages_template_enum" AS ENUM (
        'default', 'full_width', 'landing', 'contact', 'sidebar'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "static_pages_status_enum" AS ENUM ('draft', 'published', 'archived')
    `);
    await queryRunner.query(`
      CREATE TYPE "testimonials_status_enum" AS ENUM ('draft', 'published', 'archived')
    `);

    // --- Core ---------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE "sites" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "key" character varying NOT NULL,
        "name" character varying NOT NULL,
        "domain" character varying,
        CONSTRAINT "UQ_sites_key" UNIQUE ("key"),
        CONSTRAINT "PK_sites" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "website_role_assignments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "externalUserId" character varying NOT NULL,
        "role" "website_role_assignments_role_enum" NOT NULL,
        CONSTRAINT "UQ_website_role_assignments_externalUserId" UNIQUE ("externalUserId"),
        CONSTRAINT "PK_website_role_assignments" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "media" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "siteId" uuid NOT NULL,
        "storageKey" character varying NOT NULL,
        "url" character varying NOT NULL,
        "thumbnailUrl" character varying,
        "cardUrl" character varying,
        "mimeType" character varying NOT NULL,
        "sizeBytes" integer NOT NULL,
        "altText" text NOT NULL,
        "status" "media_status_enum" NOT NULL DEFAULT 'active',
        CONSTRAINT "PK_media" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_media_siteId" ON "media" ("siteId")`);

    await queryRunner.query(`
      CREATE TABLE "media_usages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "mediaId" uuid NOT NULL,
        "entityType" character varying NOT NULL,
        "entityId" uuid NOT NULL,
        CONSTRAINT "PK_media_usages" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_media_usages_mediaId_entityType_entityId"
      ON "media_usages" ("mediaId", "entityType", "entityId")
    `);

    await queryRunner.query(`
      CREATE TABLE "content_revisions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "entityType" character varying NOT NULL,
        "entityId" uuid NOT NULL,
        "versionNumber" integer NOT NULL,
        "snapshot" jsonb NOT NULL,
        "authorId" uuid NOT NULL,
        CONSTRAINT "PK_content_revisions" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_content_revisions_entityType_entityId_versionNumber"
      ON "content_revisions" ("entityType", "entityId", "versionNumber")
    `);

    // --- Site-scoped singleton content ---------------------------------------
    await queryRunner.query(`
      CREATE TABLE "about_page" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "siteId" uuid NOT NULL,
        "title" jsonb NOT NULL,
        "body" jsonb NOT NULL,
        "imageMediaId" uuid,
        "seoMetaTitle" character varying,
        "seoMetaDescription" text,
        "seoOgImageUrl" character varying,
        "seoCanonicalUrl" character varying,
        "seoNoindex" boolean NOT NULL DEFAULT false,
        "status" "about_page_status_enum" NOT NULL DEFAULT 'draft',
        CONSTRAINT "UQ_about_page_siteId" UNIQUE ("siteId"),
        CONSTRAINT "PK_about_page" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_about_page_siteId" ON "about_page" ("siteId")`);

    await queryRunner.query(`
      CREATE TABLE "site_settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "siteId" uuid NOT NULL,
        "siteName" jsonb NOT NULL,
        "tagline" jsonb,
        "logoMediaId" uuid,
        "faviconMediaId" uuid,
        "contactEmail" character varying,
        "contactPhone" character varying,
        "address" jsonb,
        "mapUrl" character varying,
        "socialLinks" jsonb NOT NULL DEFAULT '[]',
        "defaultSeoMetaTitle" character varying,
        "defaultSeoMetaDescription" text,
        "defaultSeoOgImageUrl" character varying,
        "defaultSeoCanonicalUrl" character varying,
        "defaultSeoNoindex" boolean NOT NULL DEFAULT false,
        "featureFlagsNewsEnabled" boolean NOT NULL DEFAULT true,
        "featureFlagsGalleryEnabled" boolean NOT NULL DEFAULT true,
        "featureFlagsTestimonialsEnabled" boolean NOT NULL DEFAULT true,
        "featureFlagsFaqEnabled" boolean NOT NULL DEFAULT true,
        CONSTRAINT "UQ_site_settings_siteId" UNIQUE ("siteId"),
        CONSTRAINT "PK_site_settings" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_site_settings_siteId" ON "site_settings" ("siteId")`);

    // --- Site-scoped ordered lists --------------------------------------------
    await queryRunner.query(`
      CREATE TABLE "faqs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "siteId" uuid NOT NULL,
        "question" jsonb NOT NULL,
        "answer" jsonb NOT NULL,
        "category" character varying,
        "position" integer NOT NULL DEFAULT 0,
        "status" "faqs_status_enum" NOT NULL DEFAULT 'draft',
        CONSTRAINT "PK_faqs" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_faqs_siteId" ON "faqs" ("siteId")`);
    await queryRunner.query(`CREATE INDEX "IDX_faqs_position" ON "faqs" ("position")`);

    await queryRunner.query(`
      CREATE TABLE "features" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "siteId" uuid NOT NULL,
        "title" jsonb NOT NULL,
        "description" jsonb NOT NULL,
        "icon" character varying,
        "position" integer NOT NULL DEFAULT 0,
        "status" "features_status_enum" NOT NULL DEFAULT 'draft',
        CONSTRAINT "PK_features" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_features_siteId" ON "features" ("siteId")`);
    await queryRunner.query(`CREATE INDEX "IDX_features_position" ON "features" ("position")`);

    await queryRunner.query(`
      CREATE TABLE "gallery_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "siteId" uuid NOT NULL,
        "imageMediaId" uuid NOT NULL,
        "caption" jsonb,
        "category" character varying,
        "position" integer NOT NULL DEFAULT 0,
        "status" "gallery_items_status_enum" NOT NULL DEFAULT 'draft',
        CONSTRAINT "PK_gallery_items" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_gallery_items_siteId" ON "gallery_items" ("siteId")`);
    await queryRunner.query(`CREATE INDEX "IDX_gallery_items_category" ON "gallery_items" ("category")`);
    await queryRunner.query(`CREATE INDEX "IDX_gallery_items_position" ON "gallery_items" ("position")`);

    await queryRunner.query(`
      CREATE TABLE "hero_slides" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "siteId" uuid NOT NULL,
        "heading" jsonb NOT NULL,
        "subheading" jsonb,
        "ctaLabel" jsonb,
        "ctaUrl" character varying,
        "backgroundMediaId" uuid,
        "position" integer NOT NULL DEFAULT 0,
        "status" "hero_slides_status_enum" NOT NULL DEFAULT 'draft',
        CONSTRAINT "PK_hero_slides" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_hero_slides_siteId" ON "hero_slides" ("siteId")`);
    await queryRunner.query(`CREATE INDEX "IDX_hero_slides_position" ON "hero_slides" ("position")`);

    await queryRunner.query(`
      CREATE TABLE "testimonials" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "siteId" uuid NOT NULL,
        "authorName" character varying NOT NULL,
        "authorRole" jsonb,
        "content" jsonb NOT NULL,
        "rating" integer,
        "avatarMediaId" uuid,
        "position" integer NOT NULL DEFAULT 0,
        "status" "testimonials_status_enum" NOT NULL DEFAULT 'draft',
        CONSTRAINT "PK_testimonials" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_testimonials_siteId" ON "testimonials" ("siteId")`);
    await queryRunner.query(`CREATE INDEX "IDX_testimonials_position" ON "testimonials" ("position")`);

    await queryRunner.query(`
      CREATE TABLE "portal_links" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "siteId" uuid NOT NULL,
        "label" jsonb NOT NULL,
        "url" character varying NOT NULL,
        "icon" character varying,
        "position" integer NOT NULL DEFAULT 0,
        "visible" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_portal_links" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_portal_links_siteId" ON "portal_links" ("siteId")`);
    await queryRunner.query(`CREATE INDEX "IDX_portal_links_position" ON "portal_links" ("position")`);

    // --- Navigation ------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE "menus" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "siteId" uuid NOT NULL,
        "key" character varying NOT NULL,
        "name" character varying NOT NULL,
        CONSTRAINT "PK_menus" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_menus_siteId" ON "menus" ("siteId")`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_menus_siteId_key" ON "menus" ("siteId", "key")`);

    await queryRunner.query(`
      CREATE TABLE "menu_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "siteId" uuid NOT NULL,
        "menuId" uuid NOT NULL,
        "parentId" uuid,
        "label" jsonb NOT NULL,
        "linkType" "menu_items_linktype_enum" NOT NULL,
        "pageId" uuid,
        "url" character varying,
        "position" integer NOT NULL DEFAULT 0,
        "visible" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_menu_items" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_menu_items_siteId" ON "menu_items" ("siteId")`);
    await queryRunner.query(`CREATE INDEX "IDX_menu_items_menuId" ON "menu_items" ("menuId")`);
    await queryRunner.query(`CREATE INDEX "IDX_menu_items_parentId" ON "menu_items" ("parentId")`);
    await queryRunner.query(`CREATE INDEX "IDX_menu_items_position" ON "menu_items" ("position")`);

    // --- Indexable public pages -------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE "news_articles" (
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
        "featuredImageMediaId" uuid,
        "seoMetaTitle" character varying,
        "seoMetaDescription" text,
        "seoOgImageUrl" character varying,
        "seoCanonicalUrl" character varying,
        "seoNoindex" boolean NOT NULL DEFAULT false,
        "publishAt" TIMESTAMP WITH TIME ZONE,
        "status" "news_articles_status_enum" NOT NULL DEFAULT 'draft',
        CONSTRAINT "PK_news_articles" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_news_articles_siteId" ON "news_articles" ("siteId")`);
    await queryRunner.query(`CREATE INDEX "IDX_news_articles_category" ON "news_articles" ("category")`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_news_articles_siteId_slug" ON "news_articles" ("siteId", "slug")
    `);

    await queryRunner.query(`
      CREATE TABLE "static_pages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "siteId" uuid NOT NULL,
        "title" jsonb NOT NULL,
        "slug" character varying NOT NULL,
        "body" jsonb NOT NULL,
        "template" "static_pages_template_enum" NOT NULL DEFAULT 'default',
        "parentId" uuid,
        "showInMenu" boolean NOT NULL DEFAULT true,
        "isHomepage" boolean NOT NULL DEFAULT false,
        "featuredImageMediaId" uuid,
        "seoMetaTitle" character varying,
        "seoMetaDescription" text,
        "seoOgImageUrl" character varying,
        "seoCanonicalUrl" character varying,
        "seoNoindex" boolean NOT NULL DEFAULT false,
        "publishAt" TIMESTAMP WITH TIME ZONE,
        "status" "static_pages_status_enum" NOT NULL DEFAULT 'draft',
        CONSTRAINT "PK_static_pages" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_static_pages_siteId" ON "static_pages" ("siteId")`);
    await queryRunner.query(`CREATE INDEX "IDX_static_pages_parentId" ON "static_pages" ("parentId")`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_static_pages_siteId_slug" ON "static_pages" ("siteId", "slug")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse order of creation. No FKs exist between these tables, so
    // order only matters relative to this migration's own statements.
    await queryRunner.query(`DROP TABLE "static_pages"`);
    await queryRunner.query(`DROP TABLE "news_articles"`);
    await queryRunner.query(`DROP TABLE "menu_items"`);
    await queryRunner.query(`DROP TABLE "menus"`);
    await queryRunner.query(`DROP TABLE "portal_links"`);
    await queryRunner.query(`DROP TABLE "testimonials"`);
    await queryRunner.query(`DROP TABLE "hero_slides"`);
    await queryRunner.query(`DROP TABLE "gallery_items"`);
    await queryRunner.query(`DROP TABLE "features"`);
    await queryRunner.query(`DROP TABLE "faqs"`);
    await queryRunner.query(`DROP TABLE "site_settings"`);
    await queryRunner.query(`DROP TABLE "about_page"`);
    await queryRunner.query(`DROP TABLE "content_revisions"`);
    await queryRunner.query(`DROP TABLE "media_usages"`);
    await queryRunner.query(`DROP TABLE "media"`);
    await queryRunner.query(`DROP TABLE "website_role_assignments"`);
    await queryRunner.query(`DROP TABLE "sites"`);

    await queryRunner.query(`DROP TYPE "testimonials_status_enum"`);
    await queryRunner.query(`DROP TYPE "static_pages_status_enum"`);
    await queryRunner.query(`DROP TYPE "static_pages_template_enum"`);
    await queryRunner.query(`DROP TYPE "news_articles_status_enum"`);
    await queryRunner.query(`DROP TYPE "menu_items_linktype_enum"`);
    await queryRunner.query(`DROP TYPE "hero_slides_status_enum"`);
    await queryRunner.query(`DROP TYPE "gallery_items_status_enum"`);
    await queryRunner.query(`DROP TYPE "features_status_enum"`);
    await queryRunner.query(`DROP TYPE "faqs_status_enum"`);
    await queryRunner.query(`DROP TYPE "about_page_status_enum"`);
    await queryRunner.query(`DROP TYPE "media_status_enum"`);
    await queryRunner.query(`DROP TYPE "website_role_assignments_role_enum"`);

    // Deliberately not dropping the "uuid-ossp" extension: it's
    // instance/database-wide and may be relied on outside this schema.
  }
}
