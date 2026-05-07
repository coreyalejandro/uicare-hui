import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    include: ["tests/governance/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@uicare-hui/safety-core": resolve(__dirname, "packages/safety-core/src/index.ts"),
    },
  },
});
