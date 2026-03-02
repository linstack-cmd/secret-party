import { execSync, spawn } from "node:child_process";
import pg from "pg";
import { env } from "@secret-party/env/env";

const dbUrl = new URL(env.DATABASE_URL);

async function waitForPostgres(timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const client = new pg.Client({ connectionString: env.DATABASE_URL });
    try {
      await client.connect();
      await client.end();
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error(
    `Timed out waiting for Postgres on ${dbUrl.hostname}:${dbUrl.port}`,
  );
}

function startPostgres() {
  if (dbUrl.hostname !== "localhost") {
    throw new Error(
      `Refusing to start local Postgres: DATABASE_URL points to "${dbUrl.hostname}", not localhost`,
    );
  }

  const docker = spawn(
    "docker",
    [
      "run",
      "--rm",
      "-e",
      `POSTGRES_USER=${dbUrl.username}`,
      "-e",
      `POSTGRES_PASSWORD=${dbUrl.password}`,
      "-e",
      `POSTGRES_DB=${dbUrl.pathname.slice(1)}`,
      "-p",
      `${dbUrl.port}:5432`,
      "postgres",
      "-c",
      "log_statement=all",
    ],
    { stdio: "inherit" },
  );

  docker.on("error", (err) => {
    console.error("Failed to start Docker:", err);
    process.exit(1);
  });

  docker.on("exit", (code) => {
    process.exit(code ?? 1);
  });

  const kill = () => {
    if (docker.exitCode === null && !docker.killed) {
      docker.kill("SIGTERM");
    }
  };

  process.on("SIGINT", kill);
  process.on("SIGTERM", kill);

  return kill;
}

async function main() {
  const killPostgres = startPostgres();

  try {
    await waitForPostgres();
    console.log("Postgres is ready. Running migrations...");
    execSync("pnpm drizzle-kit migrate", { stdio: "inherit" });
    console.log("Migrations complete.");
  } catch (err) {
    console.error(err);
    killPostgres();
    process.exit(1);
  }
}

main();
