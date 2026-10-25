import type { LoggerService } from '@nestjs/common';

/**
 * Minimal structured (JSON-lines) logger.
 *
 * Every line is a single JSON object — `{ time, level, msg, ...fields }` —
 * so log aggregators (CloudWatch, Loki, Datadog, …) can parse fields
 * without a per-deployment regex. Deliberately dependency-light: no
 * pino/winston, because the only requirements here are "one JSON object
 * per line" + "honor LOG_LEVEL", both of which are a few lines.
 *
 * Levels: `debug < info < warn < error`. A message logs when its level
 * is >= the configured `LOG_LEVEL` (env, default `info`) — so
 * `LOG_LEVEL=debug` locally, `warn` in a noisy production if desired.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_VALUE: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const VALID_LEVELS = new Set<LogLevel>(['debug', 'info', 'warn', 'error']);

function resolveLevel(): LogLevel {
  const raw = (process.env.LOG_LEVEL ?? '').trim().toLowerCase();
  return VALID_LEVELS.has(raw as LogLevel) ? (raw as LogLevel) : 'info';
}

/** True when a message at `level` should be emitted under the current LOG_LEVEL. */
export function isLevelEnabled(level: LogLevel): boolean {
  return LEVEL_VALUE[level] >= LEVEL_VALUE[resolveLevel()];
}

/**
 * Emit one structured log line. Serializes to stdout for
 * debug/info/warn and stderr for error (so `2>` can separate them).
 * `fields` are merged into the top-level object — keep them flat and
 * non-PII (ids, counts, durations — never bodies, tokens, or passwords).
 */
export function logJson(
  level: LogLevel,
  message: string,
  fields: Record<string, unknown> = {},
): void {
  if (!isLevelEnabled(level)) return;

  const line = JSON.stringify({
    time: new Date().toISOString(),
    level,
    msg: message,
    ...fields,
  });

  // eslint-disable-next-line no-console
  const write = level === 'error' ? console.error : console.log;
  write(line);
}

/**
 * NestJS `LoggerService` adapter that funnels Nest's own logs (bootstrap,
 * RouterExplorer, `new Logger(...)` calls) through `logJson` — enabled
 * only when `LOG_FORMAT=json` (see main.ts), so local dev keeps Nest's
 * human-readable default and production can opt into machine-readable
 * output. `optionalParams` (Nest passes context/stack there) are
 * forwarded as a `details` array rather than dropped.
 */
export class JsonLogger implements LoggerService {
  log(message: unknown, ...optionalParams: unknown[]): void {
    this.emit('info', message, optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.emit('error', message, optionalParams);
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.emit('warn', message, optionalParams);
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.emit('debug', message, optionalParams);
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.emit('debug', message, optionalParams);
  }

  private emit(
    level: LogLevel,
    message: unknown,
    optionalParams: unknown[],
  ): void {
    const fields: Record<string, unknown> = {};
    if (optionalParams.length) fields.details = optionalParams;
    logJson(
      level,
      typeof message === 'string' ? message : String(message),
      fields,
    );
  }
}
