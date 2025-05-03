import database from "infra/database";
import migrationRunner from "node-pg-migrate";
import { join } from "node:path";

export default async function migrations(request, response) {
  const defaultMigrationsRunnerOptions = {
    databaseUrl: process.env.DATABASE_URL,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };
  if (request.method === "GET") {
    console.log("Entrou no GET");
    const migrations = await migrationRunner(defaultMigrationsRunnerOptions);
    return response.status(200).json(migrations);
  }
  if (request.method === "POST") {
    console.log("Entrou no POST");
    const migrationsMigrated = await migrationRunner({
      ...defaultMigrationsRunnerOptions,
      dryRun: false,
    });

    if(migrationsMigrated.length > 0) return response.status(201).json(migrationsMigrated)

    return response.status(200).json(migrationsMigrated);
  }

  return response.status(405).end();
}
