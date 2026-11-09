import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

/**
 * Vitest config — merged onto the app's existing Vite config so tests
 * reuse the app's React plugin and native tsconfig path resolution
 * rather than re-declaring them and risking drift. Only the `test`
 * block is added here; build/serve settings are ignored by Vitest.
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
