import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CmsAdminUser } from '../admin-users/entities/admin-user.entity';
import { CmsAuthService } from './cms-auth.service';
import { CmsAuthController } from './cms-auth.controller';
import { CmsAuthGuard } from './cms-auth.guard';
import { CmsPermissionGuard } from './cms-permission.guard';
import { PasswordHasherService } from './password/password-hasher.service';
import { CmsRefreshToken } from './entities/cms-refresh-token.entity';
import { CmsRefreshTokenService } from './cms-refresh-token.service';

/**
 * CMS Admin's dedicated auth module — the backend-core deliverable of
 * Sprint 2.3A. Lives under `identity/auth/`, a sibling of
 * `identity/admin-users/`, deliberately *not* inside `modules/website/auth/`
 * (that folder is SMS's integration point: `WebsiteAuthGuard`,
 * `WebsiteRoleAssignment`, `WebsitePermissionGuard`). Nothing in this
 * module imports from or is imported by that folder except the shared,
 * already-existing `WebsiteRole`/`ROLE_PERMISSIONS` map, which both
 * sides deliberately reuse rather than duplicate (see `CmsAdminUser`'s
 * doc comment).
 *
 * `JwtModule.register({})` — same empty-options pattern as
 * `WebsiteAuthModule` — because the secret/issuer/expiry are supplied
 * per-call (`CmsAuthGuard.canActivate`, `CmsAuthService.signAccessToken`)
 * from `ConfigService`, not fixed at module-registration time. This
 * keeps `CMS_JWT_SECRET` out of the DI container's static config and
 * lets it be read fresh from `process.env` the same way
 * `SMS_JWT_PUBLIC_KEY_PATH` is.
 *
 * Sprint — Persistent Login: also registers `CmsRefreshToken`
 * (`entities/cms-refresh-token.entity.ts`) and `CmsRefreshTokenService`,
 * used only by `CmsAuthController`'s `refresh`/`logout` routes.
 * `adminUserFeature` and `refreshTokenFeature` are deliberately two
 * separate `TypeOrmModule.forFeature(...)` calls, not one combined
 * `forFeature([CmsAdminUser, CmsRefreshToken])` — only the former is
 * re-exported below, so `Repository<CmsRefreshToken>` stays
 * uninjectable outside this module (a single combined registration
 * would export *both* repositories once re-exported, silently
 * contradicting that intent).
 *
 * Exports `CmsAuthGuard` and, since Sprint 3.2, `CmsPermissionGuard`
 * (so every CMS Admin content module — Media, News, Pages, Hero,
 * Gallery, etc. — can protect its routes via `RequireCmsPermission`
 * without re-declaring either guard) and `adminUserFeature` (so a
 * future admin-management module — Sprint 2.3B — can inject
 * `Repository<CmsAdminUser>` without this module needing to know about
 * it).
 */
const adminUserFeature = TypeOrmModule.forFeature([CmsAdminUser]);
const refreshTokenFeature = TypeOrmModule.forFeature([CmsRefreshToken]);

@Module({
  imports: [JwtModule.register({}), adminUserFeature, refreshTokenFeature],
  controllers: [CmsAuthController],
  providers: [
    CmsAuthService,
    CmsAuthGuard,
    CmsPermissionGuard,
    PasswordHasherService,
    CmsRefreshTokenService,
  ],
  exports: [CmsAuthGuard, CmsPermissionGuard, PasswordHasherService, JwtModule, adminUserFeature],
})
export class CmsAuthModule {}
