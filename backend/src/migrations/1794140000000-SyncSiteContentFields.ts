import { MigrationInterface, QueryRunner } from 'typeorm';

export class SyncSiteContentFields1794140000000 implements MigrationInterface {
  name = 'SyncSiteContentFields1794140000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site_settings" ADD "mapLatitude" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_settings" ADD "mapLongitude" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "gallery_items" ADD "isFeatured" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "testimonials" ADD "isFeatured" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_gallery_items_isFeatured" ON "gallery_items" ("isFeatured")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_testimonials_isFeatured" ON "testimonials" ("isFeatured")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_testimonials_isFeatured"`);
    await queryRunner.query(`DROP INDEX "IDX_gallery_items_isFeatured"`);
    await queryRunner.query(
      `ALTER TABLE "testimonials" DROP COLUMN "isFeatured"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gallery_items" DROP COLUMN "isFeatured"`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_settings" DROP COLUMN "mapLongitude"`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_settings" DROP COLUMN "mapLatitude"`,
    );
  }
}
