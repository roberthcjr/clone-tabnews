import database from "infra/database.js";
import migrationRunner from "node-pg-migrate";
import { join } from "node:path";

const ACCEPTED_METHODS = ["GET", "POST"];

export default async function migrations(request, response) {
  if (!ACCEPTED_METHODS.includes(request.method)) {
    return response.status(405).json({
      error: `Method "${request.method}" not allowed`,
    });
  }

  let dbClient;
  try {
    dbClient = await database.getNewClient();
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
      return response.status(200).json(migrations);
    }
    if (request.method === "POST") {
      console.log("Entrou no POST");
      const migrationsMigrated = await migrationRunner({
        ...defaultMigrationsRunnerOptions,
        dryRun: false,
      });

      if (migrationsMigrated.length > 0)
        return response.status(201).json(migrationsMigrated);

      return response.status(200).json(migrationsMigrated);
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await dbClient.end();
  }
}
