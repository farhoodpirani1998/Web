import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

/**
 * Vitest config — merged onto the app's existing Vite config so tests
 * reuse the exact same plugins (React + `vite-tsconfig-paths`, which is
 * what resolves the `@/*` alias) rather than re-declaring them and
 * risking drift. Only the `test` block is added here; the build/serve
 * settings from `vite.config.ts` are irrelevant to Vitest and ignored.
 */
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      // Exposes the test globals (`afterEach`, …) React Testing Library
      // needs to register its auto-cleanup between tests — without it,
      // rendered components accumulate across tests in a file.
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
      include: ["src/**/*.{test,spec}.{ts,tsx}"],
      css: false,
    },
  }),
);
