import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkingHoursAndCampusCoordinates1794150000000 implements MigrationInterface {
  name = 'AddWorkingHoursAndCampusCoordinates1794150000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site_settings" ADD "workingHours" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "campuses" ADD "latitude" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "campuses" ADD "longitude" double precision`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "campuses" DROP COLUMN "longitude"`);
    await queryRunner.query(`ALTER TABLE "campuses" DROP COLUMN "latitude"`);
    await queryRunner.query(
      `ALTER TABLE "site_settings" DROP COLUMN "workingHours"`,
    );
  }
}
