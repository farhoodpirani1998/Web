import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
//
// Path aliases are resolved by `vite-tsconfig-paths`, which reads the
// canonical alias map from `tsconfig.app.json` (`compilerOptions.paths`).
// That file is the single source of truth for aliases — do not also add
// a manual `resolve.alias` here, or the two can silently drift apart.
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 5173,
    host: true,
    strictPort: false,
  },
  preview: {
    port: 4173,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    target: "es2022",
  },
});
