import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewsletterSubscribers1794150000000 implements MigrationInterface {
  name = 'AddNewsletterSubscribers1794150000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "newsletter_subscribers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "siteId" uuid NOT NULL,
        "email" character varying(254) NOT NULL,
        CONSTRAINT "PK_newsletter_subscribers" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_newsletter_subscribers_siteId_email"
      ON "newsletter_subscribers" ("siteId", "email")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_newsletter_subscribers_siteId_createdAt"
      ON "newsletter_subscribers" ("siteId", "createdAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "newsletter_subscribers"`);
  }
}
