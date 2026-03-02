import { env } from "@secret-party/env/env";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

// The pg driver's default INT8 parser calls parseInt(), which silently corrupts
// values above Number.MAX_SAFE_INTEGER. CockroachDB's unique_rowid() always
// generates INT8 IDs in that range, so we must return them as strings.
pg.types.setTypeParser(pg.types.builtins.INT8, String);

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
