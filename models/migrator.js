import { resolve } from "node:path";
import migrationRunner from "node-pg-migrate";

import database from "infra/database.js";
import { ServiceError } from "infra/errors";

export async function listPendingMigrations() {
  const pendingMigrations = await runMigrations({ isDryRun: true });
  return pendingMigrations;
}

export async function runPendingMigrations() {
  const runnedMigrations = await runMigrations({ isDryRun: false });
  return runnedMigrations;
}

async function runMigrations({ isDryRun = false }) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const migrations = await migrationRunner({
      databaseUrl: dbClient,
      dryRun: isDryRun,
      dir: resolve("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    });
    return migrations;
  } catch (error) {
    let migratorError = new ServiceError(
      "Houve um erro nos serviços de migração",
      { cause: error },
    );
    throw migratorError;
  } finally {
    dbClient?.end();
  }
}
