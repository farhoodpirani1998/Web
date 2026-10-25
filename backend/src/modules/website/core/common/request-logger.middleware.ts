import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { logJson } from './json-logger';

/**
 * Correlation id added to every request so a single logical call can be
 * traced end-to-end across log lines (and, later, across services if
 * the id is propagated). Reads an inbound `x-request-id` (so a proxy or
 * upstream service can supply its own) and falls back to a fresh UUID;
 * echoes it back on the response so the client/browser can correlate too.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

/** Paths whose requests are not logged — health checks / static media would otherwise spam the log. */
const DEFAULT_IGNORE = ['/health', '/uploads'];

function ignored(path: string): boolean {
  const configured = (process.env.LOG_IGNORE_PATHS ?? '').trim();
  const prefixes = configured
    ? configured
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
    : DEFAULT_IGNORE;
  return prefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

/**
 * Express middleware: assigns a correlation id, then logs exactly one
 * structured line per request on completion — method, path, status,
 * duration, client ip, and the id. Successes go at `info`, 5xx at
 * `error`, everything else (3xx/4xx) at `warn`, so a log filter can
 * surface problems without parsing the status code.
 *
 * Reads `req.ip` (respects the `trust proxy` setting configured in
 * main.ts) — a real client address behind a reverse proxy, not the
 * proxy's. Query strings are logged as `req.path` only (never the raw
 * `req.url`), so an id/token accidentally placed in a query param never
 * lands in the log.
 */
export function createRequestLogger() {
  return function requestLogger(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const inbound = req.headers['x-request-id'];
    const correlationId =
      (Array.isArray(inbound) ? inbound[0] : inbound)?.trim() || randomUUID();
    req.correlationId = correlationId;
    res.setHeader('x-request-id', correlationId);

    if (ignored(req.path)) {
      next();
      return;
    }

    const startedAt = process.hrtime.bigint();

    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
      const status = res.statusCode;
      const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';

      logJson(level, 'request', {
        correlationId,
        method: req.method,
        path: req.path,
        status,
        durationMs: Math.round(durationMs * 100) / 100,
        ip: req.ip,
      });
    });

    next();
  };
}
