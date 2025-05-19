import { createRouter } from "next-connect";
import { resolve } from "node:path";
import migrationRunner from "node-pg-migrate";

import database from "infra/database.js";
import { InternalServerError, MethodNotAllowedError } from "infra/errors.js";

const router = createRouter();

router.get(getMigrations).post(runMigrations);
export default router.handler({
  onError: onErrorHandler,
  onNoMatch: onNoMatchHandler,
});

async function getMigrations(request, response) {
  const migrations = await migrationRunner(
    await getDbConfiguration({ isDryRun: true }),
  );
  return response.status(200).json(migrations);
}

async function runMigrations(request, response) {
  const migrationsMigrated = await migrationRunner(
    await getDbConfiguration({}),
  );

  if (migrationsMigrated.length > 0)
    return response.status(201).json(migrationsMigrated);

  return response.status(200).json(migrationsMigrated);
}

function onNoMatchHandler(request, response) {
  const publicError = new MethodNotAllowedError();
  return response.status(publicError.statusCode).json(publicError);
}

function onErrorHandler(error, request, response) {
  console.log("\n Erro dentro do catch do next-connect");
  console.error(error);

  let publicError = error;

  if (!(publicError instanceof InternalServerError))
    publicError = new InternalServerError({ error });

  return response.status(publicError.statusCode).json(publicError);
}

async function getDbConfiguration({ isDryRun = false }) {
  const dbClient = await database.getNewClient();
  const defaultMigrationsRunnerOptions = {
    databaseUrl: dbClient,
    dryRun: false,
    dir: resolve("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };
  if (isDryRun)
    return {
      ...defaultMigrationsRunnerOptions,
      dryRun: true,
    };

  return defaultMigrationsRunnerOptions;
}
