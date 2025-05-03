import database from "infra/database";

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

beforeAll(cleanDatabase);

test("first POST to /api/v1/migrations, should return success and an array of migrations", async () => {
  const response = await fetch('http://localhost:3000/api/v1/migrations', {method: 'POST'});
  const responseBody = await response.json();

  expect(response.status).toBe(201);
  expect(Array.isArray(responseBody)).toBeTruthy();
  expect(responseBody.length).toBeGreaterThan(0);
});

test("second POST to /api/v1/migrations, should return success and an array of migrations", async () => {
  const response = await fetch('http://localhost:3000/api/v1/migrations', {method: 'POST'});
  const responseBody = await response.json();

  expect(response.status).toBe(200);
  expect(Array.isArray(responseBody)).toBeTruthy();
  expect(responseBody.length).toBe(0);
});