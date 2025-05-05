import database from "infra/database.js";
import migrationRunner from "node-pg-migrate";
import { join } from "node:path";

export default async function migrations(request, response) {
  const dbClient = await database.getNewClient();
  const defaultMigrationsRunnerOptions = {
    databaseUrl: dbClient,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };
  if (request.method === "GET") {
    console.log("Entrou no GET");
    const migrations = await migrationRunner(defaultMigrationsRunnerOptions);
    await dbClient.end();
    return response.status(200).json(migrations);
  }
  if (request.method === "POST") {
    console.log("Entrou no POST");
    const migrationsMigrated = await migrationRunner({
      ...defaultMigrationsRunnerOptions,
      dryRun: false,
    });

    await dbClient.end();

    if(migrationsMigrated.length > 0) return response.status(201).json(migrationsMigrated)
    
    return response.status(200).json(migrationsMigrated);
  }

  return response.status(405).end();
}
