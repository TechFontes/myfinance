import { defineConfig, env } from "prisma/config";
import "dotenv/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node --no-warnings=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types prisma/seed.ts",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
