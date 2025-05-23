import { waitForAllServices, clearDatabase } from "tests/orchestrator";

beforeAll(async () => {
  await waitForAllServices();
  await clearDatabase();
});

describe("GET to api/v1/migrations", () => {
  describe("Anonymous user", () => {
    describe("Retrieving pending migrations", () => {
      test("should return success with an array of migrations", async () => {
        const response = await fetch("http://localhost:3000/api/v1/migrations");
        const responseBody = await response.json();

        expect(response.status).toBe(200);
        expect(Array.isArray(responseBody)).toBeTruthy();
        expect(responseBody.length).toBeGreaterThan(0);
      });
    });
  });
});
