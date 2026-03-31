import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    setupFiles: ["./tests/setup/vitest.setup.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
})
