import waitForAllServices from "tests/orchestrator";

beforeAll(async () => {
  await waitForAllServices();
});

describe("DELETE to api/v1/migrations", () => {
  describe("Anonymous user", () => {
    describe("Running pending migrations", () => {
      test("should return a not found route", async () => {
        const response = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "DELETE",
          },
        );

        expect(response.status).toBe(405);
      });
    });
  });
});
