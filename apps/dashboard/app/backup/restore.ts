import { db } from "@secret-party/database/db";
import { getTableName, sql } from "drizzle-orm";
import {
  userTable,
  projectTable,
  environmentTable,
  secretTable,
  apiClientTable,
  environmentAccessTable,
  auditLogTable,
  sessionTable,
} from "@secret-party/database/schema";
import type { BackupData } from "./backup";

const SUPPORTED_VERSIONS = [1];

/** Tables in dependency order: leaves first, roots last. */
const TRUNCATE_ORDER = [
  auditLogTable,
  environmentAccessTable,
  secretTable,
  sessionTable,
  environmentTable,
  apiClientTable,
  projectTable,
  userTable,
];

export function validateBackup(data: unknown): data is BackupData {
  if (typeof data !== "object" || data === null) return false;

  const backup = data as Record<string, unknown>;

  if (typeof backup.version !== "number") return false;
  if (!SUPPORTED_VERSIONS.includes(backup.version)) return false;
  if (typeof backup.createdAt !== "string") return false;
  if (typeof backup.tables !== "object" || backup.tables === null) return false;

  const tables = backup.tables as Record<string, unknown>;
  const requiredTables: (keyof BackupData["tables"])[] = [
    "user",
    "project",
    "environment",
    "secret",
    "api_client",
    "environment_access",
    "audit_log",
  ];

  for (const table of requiredTables) {
    if (!Array.isArray(tables[table])) return false;
  }

  return true;
}

export async function restoreFromBackup(backup: BackupData): Promise<void> {
  await db.transaction(async (tx) => {
    // Truncate all tables in dependency order (leaves first, roots last).
    for (const table of TRUNCATE_ORDER) {
      await tx.execute(sql`TRUNCATE TABLE ${sql.identifier(getTableName(table))} CASCADE`);
    }

    // Insert in dependency order (roots first, leaves last).
    if (backup.tables.user.length > 0) {
      await tx.insert(userTable).values(backup.tables.user);
    }

    if (backup.tables.project.length > 0) {
      await tx.insert(projectTable).values(backup.tables.project);
    }

    if (backup.tables.environment.length > 0) {
      await tx.insert(environmentTable).values(backup.tables.environment);
    }

    if (backup.tables.secret.length > 0) {
      await tx.insert(secretTable).values(backup.tables.secret);
    }

    if (backup.tables.api_client.length > 0) {
      await tx.insert(apiClientTable).values(backup.tables.api_client);
    }

    if (backup.tables.environment_access.length > 0) {
      await tx.insert(environmentAccessTable).values(backup.tables.environment_access);
    }

    if (backup.tables.audit_log.length > 0) {
      await tx.insert(auditLogTable).values(backup.tables.audit_log);
    }
  });
}
