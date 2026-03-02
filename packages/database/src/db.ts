import { env } from "@secret-party/env/env";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
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
  // Create the Pool ourselves so the INT8 type parser override is guaranteed
  // to apply. Passing a URL string to drizzle() lets it create the Pool from
  // its own pg import, which pnpm may resolve to a different module instance.
  const pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
    types: {
      getTypeParser(oid, format) {
        if (oid === pg.types.builtins.INT8) return String;
        return pg.types.getTypeParser(oid, format);
      },
    },
  });

  return drizzle(pool, {
    casing: "snake_case",
    schema,
  });
}

export const db = globalThis.__db__ ?? buildDrizzle();

if (env.NODE_ENV !== "production") {
  globalThis.__db__ = db;
}
