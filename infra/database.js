import { Client } from "pg";
import { ServiceError } from "./errors";

const PG_CREDENTIALS = {
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  ssl: process.env.NODE_ENV === "production",
};

async function query(queryObject) {
  let client;
  try {
    client = await getNewClient();

    const response = await client.query(queryObject);

    return response;
  } catch (error) {
    throw new ServiceError("Erro na conexão com o Banco ou na Query", {
      cause: error,
    });
  } finally {
    await client?.end();
  }
}

async function getNewClient() {
  const client = new Client(PG_CREDENTIALS);
  await client.connect();
  return client;
}

const database = {
  query,
  getNewClient,
};
export default database;
