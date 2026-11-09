import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrustBadges1794150000000 implements MigrationInterface {
  name = 'AddTrustBadges1794150000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."trust_badges_status_enum" AS ENUM('draft', 'published', 'archived')`,
    );
    await queryRunner.query(`
      CREATE TABLE "trust_badges" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "siteId" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "name" jsonb NOT NULL,
        "url" text,
        "imageMediaId" uuid,
        "position" integer NOT NULL DEFAULT 0,
        "status" "public"."trust_badges_status_enum" NOT NULL DEFAULT 'draft',
        CONSTRAINT "PK_trust_badges" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_trust_badges_siteId" ON "trust_badges" ("siteId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_trust_badges_position" ON "trust_badges" ("position")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_trust_badges_position"`);
    await queryRunner.query(`DROP INDEX "IDX_trust_badges_siteId"`);
    await queryRunner.query(`DROP TABLE "trust_badges"`);
    await queryRunner.query(`DROP TYPE "public"."trust_badges_status_enum"`);
  }
}
