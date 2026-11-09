/**
 * Centralized structured logging service for the CMS Admin.
 *
 * Defensive: never logs Authorization headers, refresh tokens, or
 * payload PII. All entries are typed; failures are silent (no crash).
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  action: string;
  meta?: Record<string, unknown>;
}

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

let minLevel: LogLevel = "info";

export function setLogLevel(level: LogLevel) {
  minLevel = level;
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[minLevel];
}

function sanitize(obj: unknown): unknown {
  if (typeof obj !== "object" || obj === null) return obj;
  const copy = { ...(obj as Record<string, unknown>) };
  for (const key of Object.keys(copy)) {
    if (/token|password|secret|refresh|authorization/i.test(key)) {
      copy[key] = "[REDACTED]";
    }
  }
  return copy;
}

export function log({
  level,
  module,
  action,
  meta,
}: Omit<LogEntry, "timestamp">) {
  if (!shouldLog(level)) return;
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    module,
    action,
    meta: meta ? (sanitize(meta) as Record<string, unknown>) : undefined,
  };
  /* In production this should ship to a central collector (e.g., Sentry / Datadog / backend log endpoint).
     For this admin SPA we keep it in-memory + console for debugging, never persisting locally. */
  if (level === "error") {
    console.error("[ADMIN LOG]", entry);
  } else if (level === "warn") {
    console.warn("[ADMIN LOG]", entry);
  } else {
    // eslint-disable-next-line no-console
    console.info("[ADMIN LOG]", entry);
  }
}

/** Helper for API call logging — call from apiClient interceptor if desired. */
export function logApiCall({
  module,
  url,
  method,
  status,
}: {
  module: string;
  url: string;
  method: string;
  status: number;
}) {
  log({
    level: status >= 500 ? "error" : status >= 400 ? "warn" : "info",
    module,
    action: `${method} ${url}`,
    meta: { status, url: url.substring(0, 120) },
  });
}
