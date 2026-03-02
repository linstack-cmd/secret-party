import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  userTable: {
    projects: r.many.projectTable(),
    sessions: r.many.sessionTable(),
    apiClients: r.many.apiClientTable(),
    auditLogs: r.many.auditLogTable(),
  },
  sessionTable: {
    user: r.one.userTable({
      from: r.sessionTable.userId,
      to: r.userTable.id,
      optional: false,
    }),
  },
  projectTable: {
    owner: r.one.userTable({
      from: r.projectTable.ownerId,
      to: r.userTable.id,
      optional: false,
    }),
    environments: r.many.environmentTable(),
  },
  environmentTable: {
    project: r.one.projectTable({
      from: r.environmentTable.projectId,
      to: r.projectTable.id,
      optional: false,
    }),
    secrets: r.many.secretTable(),
    access: r.many.environmentAccessTable(),
  },
  secretTable: {
    environment: r.one.environmentTable({
      from: r.secretTable.environmentId,
      to: r.environmentTable.id,
      optional: false,
    }),
  },
  apiClientTable: {
    user: r.one.userTable({
      from: r.apiClientTable.userId,
      to: r.userTable.id,
      optional: false,
    }),
    access: r.many.environmentAccessTable(),
    auditLogs: r.many.auditLogTable(),
  },
  environmentAccessTable: {
    environment: r.one.environmentTable({
      from: r.environmentAccessTable.environmentId,
      to: r.environmentTable.id,
      optional: false,
    }),
    client: r.one.apiClientTable({
      from: r.environmentAccessTable.clientId,
      to: r.apiClientTable.id,
      optional: false,
    }),
  },
  auditLogTable: {
    user: r.one.userTable({
      from: r.auditLogTable.userId,
      to: r.userTable.id,
    }),
    apiClient: r.one.apiClientTable({
      from: r.auditLogTable.apiClientId,
      to: r.apiClientTable.id,
    }),
  },
}));
