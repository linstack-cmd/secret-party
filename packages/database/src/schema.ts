import { sql } from "drizzle-orm";
import {
  text,
  integer,
  pgTable,
  primaryKey,
  timestamp,
  customType,
} from "drizzle-orm/pg-core";

/**
 * CockroachDB's SERIAL generates INT8 values via unique_rowid() that exceed
 * Number.MAX_SAFE_INTEGER. This custom type maps bigint DB columns to strings
 * in JS to avoid precision loss.
 */
export const bigintString = customType<{ data: string }>({
  dataType() {
    return "bigint";
  },
  fromDriver(value) {
    return String(value);
  },
  toDriver(value) {
    return value;
  },
  fromJson(value) {
    return String(value);
  },
  forJsonSelect(identifier, sql) {
    return sql`${identifier}::text`;
  },
});

const bigIntPrimaryKey = () => bigintString().primaryKey().default(sql`unique_rowid()`);

export const userTable = pgTable("user", {
  id: bigIntPrimaryKey(),
  email: text().notNull().unique(),
  passwordHash: text().notNull(),
  isAdmin: integer().notNull().default(0),
});

export const sessionTable = pgTable("session", {
  id: bigIntPrimaryKey(),
  userId: bigintString()
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  token: text().notNull().unique(),
  expiresAt: timestamp({ mode: "string" }).notNull(),
  createdAt: timestamp({ mode: "string" }).notNull().defaultNow(),
});

export const projectTable = pgTable("project", {
  id: bigIntPrimaryKey(),
  name: text().notNull(),
  ownerId: bigintString()
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
});

export const environmentTable = pgTable("environment", {
  id: bigIntPrimaryKey(),
  name: text().notNull(),
  projectId: bigintString()
    .notNull()
    .references(() => projectTable.id, { onDelete: "cascade" }),
  dekWrappedByPassword: text().notNull(),
});

export const secretTable = pgTable(
  "secret",
  {
    environmentId: bigintString()
      .notNull()
      .references(() => environmentTable.id, { onDelete: "cascade" }),
    key: text().notNull(),
    valueEncrypted: text().notNull(),
  },
  (table) => [primaryKey({ columns: [table.environmentId, table.key] })],
);

export const apiClientTable = pgTable("api_client", {
  id: bigIntPrimaryKey(),
  name: text().notNull(),
  publicKey: text().notNull().unique(),
  userId: bigintString()
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
});

export const environmentAccessTable = pgTable(
  "environment_access",
  {
    environmentId: bigintString()
      .notNull()
      .references(() => environmentTable.id, { onDelete: "cascade" }),
    clientId: bigintString()
      .notNull()
      .references(() => apiClientTable.id, { onDelete: "cascade" }),
    dekWrappedByClientPublicKey: text().notNull(),
  },
  (table) => [primaryKey({ columns: [table.environmentId, table.clientId] })],
);

export const auditLogTable = pgTable("audit_log", {
  id: bigIntPrimaryKey(),
  timestamp: timestamp({ mode: "string" }).notNull().defaultNow(),
  action: text().notNull(),
  userId: bigintString().references(() => userTable.id, {
    onDelete: "set null",
  }),
  apiClientId: bigintString().references(() => apiClientTable.id, {
    onDelete: "set null",
  }),
  details: text(),
});

