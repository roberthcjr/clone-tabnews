import retry from "async-retry";
import { faker } from "@faker-js/faker/.";

import database from "infra/database";
import * as migrator from "models/migrator";
import user from "models/user";
import session from "models/session";

const emailHttpUrl = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

export async function waitForAllServices() {
  await waitForWebServer();
  await waitForEmailServer();

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

  async function waitForEmailServer() {
    return retry(fetchEmailService, {
      retries: 100,
      maxTimeout: 1000,
      onRetry: (error, attempt) => {
        console.log(`Attempt ${attempt}, with error ${error}`);
      },
    });

    async function fetchEmailService() {
      const response = await fetch(emailHttpUrl);
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

export async function createSession(userId) {
  return await session.create(userId);
}

export async function deleteAllEmails() {
  await fetch(`${emailHttpUrl}/messages`, {
    method: "DELETE",
  });
}

export async function getLastEmail() {
  const emailListResponse = await fetch(`${emailHttpUrl}/messages`);
  const emailListBody = await emailListResponse.json();

  const lastEmailItem = emailListBody.pop();

  const emailTextResponse = await fetch(
    `${emailHttpUrl}/messages/${lastEmailItem.id}.plain`,
  );
  const emailTextBody = await emailTextResponse.text();

  return {
    ...lastEmailItem,
    text: emailTextBody,
  };
}
