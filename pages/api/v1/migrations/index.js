import { createRouter } from "next-connect";
import { resolve } from "node:path";
import migrationRunner from "node-pg-migrate";

import database from "infra/database.js";
import controller from "infra/controller";

const router = createRouter();

router.get(getHandler).post(postHandler);
export default router.handler(controller);

async function getHandler(request, response) {
  const migrations = await await runMigrations({ isDryRun: true });
  return response.status(200).json(migrations);
}

async function postHandler(request, response) {
  const migrationsMigrated = await runMigrations({});

  if (migrationsMigrated.length > 0)
    return response.status(201).json(migrationsMigrated);

  return response.status(200).json(migrationsMigrated);
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
  } finally {
    dbClient?.end();
  }
}
