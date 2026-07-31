import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "shared"),
      // Mirrors the "@/*": ["./client/*"] TypeScript path alias so that
      // client-side modules can be imported in unit tests without bundling
      // the full React Native / Expo runtime.
      "@": path.resolve(__dirname, "client"),
    },
  },
  test: {
    environment: "node",
    globals: true,
  },
});
