import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreRegistration } from './entities/pre-registration.entity';
import { PreRegistrationsService } from './pre-registrations.service';
import { PreRegistrationsController } from './pre-registrations.controller';
import { SiteModule } from '../../core/site/site.module';
import { CmsAuthModule } from '../../identity/auth/cms-auth.module';

/**
 * Imports only the kernel pieces it actually uses: site scoping and
 * auth (permission-gated admin routes). No ordering, no publishing, no
 * media, no revisions — same minimal-imports convention as
 * `FaqModule`/`PortalLinksService`'s own module registration.
 *
 * `PreRegistrationsService` is exported so `PublicApiModule` can inject
 * it directly for the public submit endpoint
 * (`PublicPreRegistrationController`) rather than duplicating creation
 * logic against the repository a second time.
 */
@Module({
  imports: [TypeOrmModule.forFeature([PreRegistration]), SiteModule, CmsAuthModule],
  providers: [PreRegistrationsService],
  controllers: [PreRegistrationsController],
  exports: [PreRegistrationsService],
})
export class PreRegistrationsModule {}
