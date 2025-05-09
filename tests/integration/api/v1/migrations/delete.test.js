import waitForAllServices from "tests/orchestrator";

beforeAll(async () => {
  await waitForAllServices();
});

test("DELETE to /api/v1/migrations, should return status 405", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "DELETE",
  });

  expect(response.status).toBe(405);
});
