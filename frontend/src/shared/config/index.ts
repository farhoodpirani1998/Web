/**
 * Public surface of the shared runtime configuration layer.
 *
 * Every module that needs environment values, app metadata, cache
 * defaults, or feature flags imports from here — never reads
 * `import.meta.env` directly outside of `env.ts` (§20).
 */
export { env } from "./env";
export { APP_NAME, QUERY_DEFAULTS, FEATURE_FLAGS } from "./app";
