// Prisma stops auto-loading .env once a config file exists, so load it here.
// On hosted platforms there is no .env file and this is a harmless no-op —
// DATABASE_URL comes from the platform's environment variables instead.
import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

// Replaces the deprecated `prisma` block in package.json, which Prisma 7 drops.
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    // Used by `prisma db seed` and automatically after `prisma migrate reset`.
    seed: "tsx prisma/seed.ts",
  },
});
