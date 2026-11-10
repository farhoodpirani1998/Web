import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveExternalWebsiteRoleAssignments1794190000000 implements MigrationInterface {
  name = 'RemoveExternalWebsiteRoleAssignments1794190000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "website_role_assignments"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "website_role_assignments_role_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "website_role_assignments_role_enum" AS ENUM (
        'website_super_admin', 'content_editor', 'publisher',
        'seo_marketing_manager', 'media_manager'
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "website_role_assignments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "externalUserId" character varying NOT NULL,
        "role" "website_role_assignments_role_enum" NOT NULL,
        CONSTRAINT "UQ_website_role_assignments_externalUserId" UNIQUE ("externalUserId"),
        CONSTRAINT "PK_website_role_assignments" PRIMARY KEY ("id")
      )
    `);
  }
}
