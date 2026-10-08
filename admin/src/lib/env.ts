/**
 * Typed environment configuration.
 *
 * This is the only module in the application that reads `import.meta.env`
 * directly — everything else should import `env` from here. Mirrors the
 * pattern used by the public frontend (`frontend/src/shared/config/env.ts`).
 *
 * Sprint 2.4A scope: adds `adminApiBaseUrl` for the CMS admin API client.
 * This must only ever point at the CMS admin API (`/admin/auth/...`) —
 * never the SMS/public API base URL. See `frontend/.env.example` for the
 * contrasting public-API-only variable this deliberately does not reuse.
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
  /**
   * Base URL of the CMS admin API (never the SMS/public API — CMS admin
   * auth is entirely independent, per the Sprint 2.4A architecture
   * context). Endpoint functions append paths like `/auth/login` to this,
   * matching the NestJS `@Controller('admin/auth')` route prefix.
   */
  adminApiBaseUrl: requireEnv(
    "VITE_ADMIN_API_BASE_URL",
    "http://localhost:3100/admin",
  ),

  /** Non-sensitive environment label, useful for diagnostics/logging only. */
  appEnv: requireEnv("VITE_APP_ENV", "development"),

  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;
