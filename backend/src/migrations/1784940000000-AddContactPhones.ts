import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContactPhones1784940000000 implements MigrationInterface {
  name = 'AddContactPhones1784940000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site_settings" ADD "contactPhones" jsonb`,
    );
    await queryRunner.query(`
      UPDATE "site_settings"
      SET "contactPhones" = jsonb_build_array("contactPhone")
      WHERE "contactPhone" IS NOT NULL AND btrim("contactPhone") <> ''
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site_settings" DROP COLUMN "contactPhones"`,
    );
  }
}
