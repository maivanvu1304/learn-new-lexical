import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: [
        "src/lib/scheduling/**/*.ts",
        "src/lib/scoring/**/*.ts",
        "src/lib/streak/**/*.ts"
      ],
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 80
      }
    }
  }
});
