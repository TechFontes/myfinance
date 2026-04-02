import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: [
      { find: "@/types", replacement: path.resolve(__dirname, "./app/types") },
      { find: "@", replacement: path.resolve(__dirname, "./app") },
    ],
  },
  test: {
    setupFiles: ["./tests/setup/vitest.setup.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
})
