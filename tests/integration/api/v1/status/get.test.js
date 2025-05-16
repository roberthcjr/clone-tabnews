import waitForAllServices from "tests/orchestrator";

beforeAll(async () => {
  await waitForAllServices();
});

describe("GET to /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("should return success", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status");
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody.updated_at).toBeDefined();

      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);
    });

    test("should return valid date in updated_at", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status");
      const responseBody = await response.json();

      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);
    });

    test("should return version 16", async () => {
      const expectedVersion = "16.0";

      const response = await fetch("http://localhost:3000/api/v1/status");
      const responseBody = await response.json();

      expect(responseBody.dependencies.database.version).toBe(expectedVersion);
    });

    test("should return 100 max connections", async () => {
      const expectedVersion = 100;

      const response = await fetch("http://localhost:3000/api/v1/status");
      const responseBody = await response.json();

      expect(responseBody.dependencies.database.max_connections).toBe(
        expectedVersion,
      );
    });

    test("should return number in active_connections", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status");
      const responseBody = await response.json();

      const parsedActiveConnections = Number(
        responseBody.dependencies.database.active_connections,
      );

      expect(responseBody.dependencies.database.active_connections).toEqual(
        parsedActiveConnections,
      );
    });

    test("should return one active connection", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status");
      const responseBody = await response.json();

      expect(responseBody.dependencies.database.active_connections).toBe(1);
    });
  });
});
