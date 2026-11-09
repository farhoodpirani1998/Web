import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAboutSections1784950000000 implements MigrationInterface {
  name = 'AddAboutSections1784950000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "about_page" ADD "sections" jsonb NOT NULL DEFAULT '{}'::jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "about_page" DROP COLUMN "sections"`,
    );
  }
}
