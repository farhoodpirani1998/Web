import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { EntityNotFoundError } from 'typeorm';
import type { Request, Response } from 'express';

/**
 * Registered as the app's single global exception filter (see
 * common.module.ts). `@Catch()` with no argument means every thrown
 * value reaches this filter — nothing falls through to Express's own
 * default error handler, which is what would otherwise risk rendering a
 * raw stack trace or driver-level error message straight into the
 * response.
 *
 * Known NestJS HttpExceptions (ValidationPipe failures, guard
 * rejections, a service's BadRequestException/ConflictException/etc.)
 * already carry a deliberately-written, safe status + body — this
 * filter forwards those completely unchanged. It only changes what
 * happens to *unexpected* errors (a bug, a TypeORM/driver failure, an
 * uncaught library error): those are always logged in full server-side,
 * and the client only ever gets a fixed, information-free 500 body.
 *
 * One specific "unexpected" error is deliberately special-cased before
 * that generic 500 handling: TypeORM's `EntityNotFoundError`, thrown by
 * every module's `findOneByOrFail`/`findOneOrFail` "get by id" call
 * (see the Sprint 3.3 audit, §4 — untested at the unit level, since
 * every `.spec.ts` mocks the repository instead of exercising the real
 * TypeORM error path). Left alone it falls through to the generic
 * branch below and becomes a 500 — the wrong result for what is, from
 * the client's point of view, an ordinary 404 (bad id, stale link, a
 * row deleted in another tab). It's translated here, once, rather than
 * having every service catch it individually, so the fix is identical
 * for all current and future modules without relying on each one
 * remembering to do it.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');
  private readonly isProduction = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Translate before anything else inspects `exception`'s type: once
    // translated this behaves exactly like any other HttpException for
    // the rest of this method (logging threshold, response shape), no
    // separate branch needed below.
    if (exception instanceof EntityNotFoundError) {
      exception = new NotFoundException('The requested resource was not found');
    }

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const error = exception instanceof Error ? exception : new Error(String(exception));

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      // Full detail (message + stack) always goes to the server log,
      // regardless of environment or exception type — never to the client.
      this.logger.error(
        `${request.method} ${request.url} -> ${status}: ${error.message}`,
        error.stack,
      );
      // Sentry.captureException is always safe to call even when
      // Sentry.init() was never run (SENTRY_DSN unset) — it's a no-op
      // in that case rather than throwing.
      Sentry.captureException(error);
    }

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      response
        .status(status)
        .json(typeof body === 'string' ? { statusCode: status, message: body } : body);
      return;
    }

    // Not a NestJS HttpException — an unexpected error. Never forward its
    // raw message or stack to the client (it could expose a table/column
    // name, a file path, a library internal, etc). Outside production,
    // the message is included to keep local debugging convenient; the
    // stack trace itself is still never sent over the wire, only logged.
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: this.isProduction ? 'Internal server error' : error.message,
    });
  }
}
