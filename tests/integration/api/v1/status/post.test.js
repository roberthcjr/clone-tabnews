import { waitForAllServices } from "tests/orchestrator";

beforeAll(async () => {
  await waitForAllServices();
});

describe("POST to /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("should return not found", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status", {
        method: "POST",
      });
      expect(response.status).toBe(405);
    });

    test("should return a MethodNotAllowedError", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status", {
        method: "POST",
      });

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "MethodNotAllowedError",
        message: "Método não permitido para esse endpoint",
        action:
          "Verifique que o método HTTP enviado é válido para esse endpoint",
        status_code: 405,
      });
    });
  });
});
