import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPreRegistrationReferenceCode1794160001000 implements MigrationInterface {
  name = 'AddPreRegistrationReferenceCode1794160001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pre_registrations" ADD COLUMN IF NOT EXISTS "referenceCode" character varying`,
    );
    await queryRunner.query(`
      UPDATE "pre_registrations"
      SET "referenceCode" = 'NH-' || upper(replace("id"::text, '-', ''))
      WHERE "referenceCode" IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "pre_registrations"
      ALTER COLUMN "referenceCode" SET NOT NULL
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pre_registrations_referenceCode"
      ON "pre_registrations" ("referenceCode")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_pre_registrations_referenceCode"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pre_registrations" DROP COLUMN IF EXISTS "referenceCode"`,
    );
  }
}
