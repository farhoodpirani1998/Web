import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CmsAdminUser } from './entities/admin-user.entity';
import { AdminUsersService } from './admin-users.service';
import { AdminUsersController } from './admin-users.controller';
import { CmsAuthModule } from '../auth/cms-auth.module';
import { PasswordHasherService } from '../auth/password/password-hasher.service';

/**
 * Admin-account management. Registers the `CmsAdminUser` entity with
 * TypeORM and adds the roster CRUD (`AdminUsersController` +
 * `AdminUsersService`) behind `website.admins:manage`.
 *
 * Imports `CmsAuthModule` for `CmsAuthGuard` + `CmsPermissionGuard` —
 * `RequireCmsPermission` (which the controller uses) resolves both from
 * the *controlling* module's injector, and CmsAuthModule is where they
 * are provided/exported. No cycle: CmsAuthModule does not import this
 * one.
 *
 * `PasswordHasherService` is provided locally (CmsAuthModule does not
 * export it) — a stateless, dependency-free hasher, so a second instance
 * here is harmless.
 *
 * Still exports `TypeOrmModule` so any other module can inject
 * `Repository<CmsAdminUser>` without re-declaring `forFeature`.
 */
@Module({
  imports: [TypeOrmModule.forFeature([CmsAdminUser]), CmsAuthModule],
  controllers: [AdminUsersController],
  providers: [AdminUsersService, PasswordHasherService],
  exports: [TypeOrmModule, AdminUsersService],
})
export class AdminUsersModule {}
