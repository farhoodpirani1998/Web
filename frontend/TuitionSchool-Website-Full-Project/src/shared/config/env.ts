/**
 * Typed environment configuration.
 *
 * This is the only module in the application that reads
 * `import.meta.env` directly — everything else imports `env` from here.
 * Centralizing this keeps env-var usage auditable and gives us one place
 * to validate required values fail fast in development.
 */

function requireEnv(name: keyof ImportMetaEnv, fallback?: string): string {
  const value = import.meta.env[name] ?? fallback;

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Copy .env.example to .env and set it.`,
    );
  }

  return value;
}

export const env = {
  /** Base URL of the Website Public API (never the admin API — §14, §30). */
  publicApiBaseUrl: requireEnv(
    "VITE_PUBLIC_API_BASE_URL",
    "http://localhost:3000/api/public",
  ),

  /**
   * The site's active locale. Phase 1 ships Persian-only (§28), so this
   * currently drives static bootstrap concerns (`<html lang/dir>`) rather
   * than any URL segment. Once a second locale ships, this becomes the
   * fallback used before a route/user selection resolves.
   */
  defaultLocale: requireEnv("VITE_DEFAULT_LOCALE", "fa"),

  /** Request timeout (ms) applied to every Public API call. */
  apiTimeoutMs: Number(requireEnv("VITE_API_TIMEOUT_MS", "15000")),

  /** Non-sensitive environment label, useful for diagnostics/logging only. */
  appEnv: requireEnv("VITE_APP_ENV", "development"),

  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;
