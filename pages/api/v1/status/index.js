import database from "infra/database.js";

export default async function status(request, response) {
  const updatedAt = new Date().toISOString();
  const databaseName = process.env.POSTGRES_DB;

  const pgVersionQueryResponse = await database.query("SHOW server_version;");
  const pgVersion = pgVersionQueryResponse.rows[0].server_version;

  const maxConnectionsQueryResponse = await database.query(
    "SHOW max_connections;",
  );
  const maxConnections = maxConnectionsQueryResponse.rows[0].max_connections;

  const activeConnectionsQueryResponse = await database.query({
    text: "SELECT count(*)::int as active_connections FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  const activeConnections =
    activeConnectionsQueryResponse.rows[0].active_connections;

  return response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: pgVersion,
        max_connections: parseInt(maxConnections),
        active_connections: activeConnections,
      },
    },
  });
}
