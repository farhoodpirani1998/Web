import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CmsAdminUser } from './entities/admin-user.entity';

/**
 * Identity foundation (Sprint 2.2). Registers `CmsAdminUser` with
 * TypeORM so the entity is loaded and the `admin_users` table is
 * available to inject a repository against. Deliberately has no
 * controllers, services, or guards of its own — login, password
 * hashing, and token issuance now live in the sibling `identity/auth/`
 * module (`CmsAuthModule`, Sprint 2.3A), which registers its own
 * `TypeOrmModule.forFeature([CmsAdminUser])` rather than importing
 * this module, since all this module offers beyond that is the same
 * registration. Exports `TypeOrmModule` (same pattern as
 * `WebsiteAuthModule`) so any other future module can inject
 * `Repository<CmsAdminUser>` without re-declaring `forFeature` itself.
 */
@Module({
  imports: [TypeOrmModule.forFeature([CmsAdminUser])],
  exports: [TypeOrmModule],
})
export class AdminUsersModule {}
