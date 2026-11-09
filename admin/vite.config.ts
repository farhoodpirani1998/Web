import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
//
// Admin runs on a different port than the public frontend (5173) so both
// can be run side by side during local development.
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
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
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [{ name: "vendor", test: /[\\/]node_modules[\\/]/, maxSize: 400_000 }],
        },
      },
    },
  },
});
