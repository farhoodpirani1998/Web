import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
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
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');
  private readonly isProduction = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
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
    }

    if (isHttpException) {
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
