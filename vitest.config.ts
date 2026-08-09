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
      // Component tests: redirect react-native imports to the web-compatible
      // CJS build so that native Flow types don't crash the Node.js runner.
      "react-native": path.resolve(
        __dirname,
        "node_modules/react-native-web/dist/cjs/index.js"
      ),
    },
  },
  test: {
    environment: "node",
    globals: true,
  },
});
