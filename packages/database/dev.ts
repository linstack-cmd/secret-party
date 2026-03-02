import { execSync, spawn } from "node:child_process";
import pg from "pg";
import { env } from "@secret-party/env/env";

const dbUrl = new URL(env.DATABASE_URL);

async function waitForCockroachDB(timeoutMs = 30_000) {
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
    `Timed out waiting for CockroachDB on ${dbUrl.hostname}:${dbUrl.port}`,
  );
}

function startCockroachDB() {
  if (dbUrl.hostname !== "localhost") {
    throw new Error(
      `Refusing to start local CockroachDB: DATABASE_URL points to "${dbUrl.hostname}", not localhost`,
    );
  }

  const docker = spawn(
    "docker",
    [
      "run",
      "--rm",
      "-p",
      `${dbUrl.port}:26257`,
      "-p",
      "8080:8080",
      "cockroachdb/cockroach:latest-v25.1",
      "start-single-node",
      "--insecure",
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
  const killCockroachDB = startCockroachDB();

  try {
    await waitForCockroachDB();
    console.log("CockroachDB is ready. Running migrations...");
    execSync("pnpm drizzle-kit migrate", { stdio: "inherit" });
    console.log("Migrations complete.");
  } catch (err) {
    console.error(err);
    killCockroachDB();
    process.exit(1);
  }
}

main();
