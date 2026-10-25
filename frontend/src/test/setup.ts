/**
 * Vitest global setup — runs once per test file (see `vitest.config.ts`'s
 * `setupFiles`). Registering `@testing-library/jest-dom` here extends
 * Vitest's `expect` with the DOM matchers (`toBeInTheDocument`, …), so
 * individual test files don't each have to import it.
 */
import "@testing-library/jest-dom/vitest";
