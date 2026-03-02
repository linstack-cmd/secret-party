import "dotenv/config";
import { z } from "zod";

const LOCAL_DATABASE_URL =
  "postgresql://secretparty:secretparty@localhost:5432/secretparty";

const schema = z.object({
  DATABASE_URL: z.string().default(LOCAL_DATABASE_URL),
  NODE_ENV: z.string().default("development"),
  BACKUP_DIR: z.string().default("./backups/"),
});

export const env = schema.parse(process.env);
