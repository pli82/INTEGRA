import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // Migrările Prisma au nevoie de conexiune directă (fără -pooler).
  // Conexiunea "pooled" (DATABASE_URL) e folosită separat, la runtime, de PrismaClient.
  datasource: {
    url: env("DIRECT_URL"),
  },
});
