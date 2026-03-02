import { env } from "@secret-party/env/env";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

declare global {
  /**
   * Global cache for the drizzle db client.
   *
   * Prevents connection pool accumulation on dev hot-reload — without this,
   * each Vite HMR update re-executes this module and creates a new pg.Pool,
   * eventually exhausting postgres's max_connections limit.
   */
  var __db__: NodePgDatabase<typeof schema> | undefined;
}

function buildDrizzle() {
  return drizzle(env.DATABASE_URL, {
    casing: "snake_case",
    schema,
  });
}

export const db = globalThis.__db__ ?? buildDrizzle();

if (env.NODE_ENV !== "production") {
  globalThis.__db__ = db;
}
