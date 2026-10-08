import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
//
// Path aliases are resolved by `vite-tsconfig-paths`, which reads the
// canonical alias map from `tsconfig.app.json` (`compilerOptions.paths`).
// That file is the single source of truth for aliases — do not also add
// a manual `resolve.alias` here, or the two can silently drift apart.
//
// Admin runs on a different port than the public frontend (5173) so both
// can be run side by side during local development.
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 5174,
    host: true,
    strictPort: false,
  },
  preview: {
    port: 4174,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    target: "es2022",
  },
});
