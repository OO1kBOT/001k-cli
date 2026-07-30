import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // text only: thresholds don't need report files, so no coverage/ dir
      reporter: ["text"],
      include: ["src/**/*.ts"],
      // cli.ts is the process entry point — its routing and error boundary are
      // covered end-to-end by tests/exit-codes.test.ts (spawned subprocess,
      // invisible to V8 instrumentation). types.ts is type-only.
      exclude: ["src/cli.ts", "src/types.ts"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
