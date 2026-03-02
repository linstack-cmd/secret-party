import { env } from "@secret-party/env/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema.ts",
  casing: "snake_case",
  dialect: "cockroach",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
