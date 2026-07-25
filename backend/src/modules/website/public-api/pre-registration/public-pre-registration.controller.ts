import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PreRegistrationsService } from '../../content/pre-registrations/pre-registrations.service';
import { CreatePreRegistrationDto } from '../../content/pre-registrations/dto/create-pre-registration.dto';
import { PUBLIC_FORM_THROTTLE } from '../common/public-rate-limit.constants';

/**
 * The first public-api endpoint that accepts a write. Unlike every
 * other controller in this module, this isn't a cached read: no
 * `Cache-Control` header, no Redis read-through, and it uses
 * `PUBLIC_FORM_THROTTLE` (5/60s by default) instead of the looser
 * `PUBLIC_THROTTLE` every read endpoint carries — see that constant's
 * own doc comment, written for exactly this controller.
 *
 * Delegates straight to `PreRegistrationsService.create` (exported by
 * `PreRegistrationsModule`) rather than a second repository-based
 * implementation: unlike this layer's read endpoints (which need
 * public-only status/visibility filtering the admin services don't
 * do), a plain insert has no such shape mismatch to justify
 * duplicating it.
 *
 * No auth, no CORS restriction beyond the app-wide config in main.ts —
 * this is a public, unauthenticated form submission endpoint by
 * design.
 */
@Throttle(PUBLIC_FORM_THROTTLE)
@Controller('public/pre-registration')
export class PublicPreRegistrationController {
  constructor(private readonly preRegistrationsService: PreRegistrationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePreRegistrationDto): Promise<{ id: string }> {
    const preRegistration = await this.preRegistrationsService.create(dto);
    return { id: preRegistration.id };
  }
}
