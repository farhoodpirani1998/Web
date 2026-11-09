import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTextbooks1794180000000 implements MigrationInterface {
  name = 'AddTextbooks1794180000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "textbooks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "site_id" uuid NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "title" jsonb NOT NULL,
        "slug" varchar(180) NOT NULL,
        "code" varchar(80) NOT NULL,
        "stage" varchar(100) NOT NULL,
        "grade" varchar(80) NOT NULL,
        "field" varchar(100),
        "subject" varchar(120) NOT NULL,
        "academic_year" varchar(24) NOT NULL,
        "edition" varchar(120),
        "page_count" integer,
        "file_size" bigint NOT NULL DEFAULT 0,
        "checksum" varchar(64),
        "cover_key" varchar(512),
        "file_key" varchar(512),
        "source_type" varchar(20) NOT NULL DEFAULT 'UPLOADED',
        "external_url" text,
        "source_attribution" varchar(300) NOT NULL,
        "license_note" text,
        "status" varchar(20) NOT NULL DEFAULT 'draft',
        "sort_order" integer NOT NULL DEFAULT 0,
        "download_count" bigint NOT NULL DEFAULT 0,
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "pk_textbooks" PRIMARY KEY ("id"),
        CONSTRAINT "chk_textbooks_source_type" CHECK ("source_type" IN ('UPLOADED', 'EXTERNAL_LINK')),
        CONSTRAINT "chk_textbooks_status" CHECK ("status" IN ('draft', 'published', 'archived'))
      )
    `);
    await queryRunner.query(
      'CREATE INDEX "idx_textbooks_site_id" ON "textbooks" ("site_id")',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "uq_textbooks_site_slug" ON "textbooks" ("site_id", "slug")',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "uq_textbooks_site_code" ON "textbooks" ("site_id", "code")',
    );
    await queryRunner.query(`
      CREATE TABLE "textbook_taxonomies" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "site_id" uuid NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "type" varchar(20) NOT NULL,
        "value" varchar(120) NOT NULL,
        "label" varchar(160) NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        CONSTRAINT "pk_textbook_taxonomies" PRIMARY KEY ("id"),
        CONSTRAINT "chk_textbook_taxonomies_type" CHECK ("type" IN ('stage', 'grade', 'field', 'subject'))
      )
    `);
    await queryRunner.query(
      'CREATE UNIQUE INDEX "uq_textbook_taxonomies_site_type_value" ON "textbook_taxonomies" ("site_id", "type", "value")',
    );
    await queryRunner.query(`
      CREATE TABLE "textbook_download_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "textbook_id" uuid NOT NULL,
        "requester_hash" varchar(64),
        CONSTRAINT "pk_textbook_download_logs" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      'CREATE INDEX "idx_textbook_download_logs_textbook_created" ON "textbook_download_logs" ("textbook_id", "created_at")',
    );
    await queryRunner.query(`
      CREATE TABLE "textbook_audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "textbook_id" uuid,
        "actor_id" uuid,
        "action" varchar(40) NOT NULL,
        CONSTRAINT "pk_textbook_audit_logs" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      'CREATE INDEX "idx_textbook_audit_logs_textbook_created" ON "textbook_audit_logs" ("textbook_id", "created_at")',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "textbook_audit_logs"');
    await queryRunner.query('DROP TABLE "textbook_download_logs"');
    await queryRunner.query('DROP TABLE "textbook_taxonomies"');
    await queryRunner.query('DROP TABLE "textbooks"');
  }
}
