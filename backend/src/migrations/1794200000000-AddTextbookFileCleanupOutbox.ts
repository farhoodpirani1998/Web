import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTextbookFileCleanupOutbox1794200000000 implements MigrationInterface {
  name = 'AddTextbookFileCleanupOutbox1794200000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "textbook_file_cleanup" (
        "file_key" varchar(512) NOT NULL,
        "attempt_count" integer NOT NULL DEFAULT 0,
        "next_attempt_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "last_error" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "exhausted_at" TIMESTAMPTZ,
        CONSTRAINT "pk_textbook_file_cleanup" PRIMARY KEY ("file_key")
      )
    `);
    await queryRunner.query(
      'CREATE INDEX "idx_textbook_file_cleanup_due" ON "textbook_file_cleanup" ("next_attempt_at")',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "textbook_file_cleanup"');
  }
}
