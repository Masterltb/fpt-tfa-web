/// <reference types="vitest" />
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Backend mounts BOTH prefixes: most routers use /api/v1, the legacy
// cohort + formation routers use bare /v1. Proxy both or those 404.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    proxy: {
      "/api": "http://localhost:8000",
      "/v1": "http://localhost:8000",
      "/health": "http://localhost:8000",
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
