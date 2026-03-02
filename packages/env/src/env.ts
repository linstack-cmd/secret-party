import "dotenv/config";
import { z } from "zod";

const LOCAL_DATABASE_URL =
  "postgresql://secretparty:secretparty@localhost:5432/secretparty";

const schema = z.object({
  DATABASE_URL: z.string().default(LOCAL_DATABASE_URL),
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(3000),
  BACKUP_CONTAINER_PATH: z
    .string()
    .default("./backups/")
    .describe(
      "Path where backup JSON files are written inside the container. Docker Compose users configure the host-side location via BACKUP_LOCATION in .env.",
    ),
});

export const env = schema.parse(process.env);
