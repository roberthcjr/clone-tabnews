import retry from "async-retry";
import { faker } from "@faker-js/faker/.";

import database from "infra/database";
import * as migrator from "models/migrator";
import user from "models/user";

export async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
      onRetry: (error, attempt) => {
        console.log(`Attempt ${attempt}, with error ${error}`);
      },
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");
      if (response.status !== 200) {
        throw new Error(`Failed to fetch, HTTP Status ${response.status}`);
      }
    }
  }
}

export async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

export async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

export async function createUser({ username, email, password } = {}) {
  return await user.create({
    username: username ?? faker.internet.username().replace(/[_.-]/g, ""),
    email: email ?? faker.internet.email(),
    password: password ?? "randomPassword",
  });
}
