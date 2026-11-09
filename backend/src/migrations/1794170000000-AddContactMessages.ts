import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContactMessages1794170000000 implements MigrationInterface {
  name = 'AddContactMessages1794170000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "contact_messages_subject_enum" AS ENUM (
        'educational-consultation',
        'course-information',
        'group-collaboration',
        'other'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "contact_messages_status_enum" AS ENUM ('new', 'contacted', 'closed')
    `);
    await queryRunner.query(`
      CREATE TABLE "contact_messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "siteId" uuid NOT NULL,
        "fullName" character varying(150) NOT NULL,
        "phone" character varying(24) NOT NULL,
        "subject" "contact_messages_subject_enum" NOT NULL,
        "message" text NOT NULL,
        "status" "contact_messages_status_enum" NOT NULL DEFAULT 'new',
        CONSTRAINT "PK_contact_messages" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_contact_messages_siteId_createdAt" ON "contact_messages" ("siteId", "createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_contact_messages_siteId" ON "contact_messages" ("siteId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_contact_messages_status" ON "contact_messages" ("status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "contact_messages"`);
    await queryRunner.query(`DROP TYPE "contact_messages_status_enum"`);
    await queryRunner.query(`DROP TYPE "contact_messages_subject_enum"`);
  }
}
