import { version as uuidVersion } from "uuid";
import {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
} from "tests/orchestrator";
import session from "models/session";

beforeAll(async () => {
  await waitForAllServices();
  await clearDatabase();
  await runPendingMigrations();
});

describe("POST to api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("With incorrect `email` but correct `password`", async () => {
      await createUser({
        password: "senha-correta",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "robert@email.com",
          password: "senha-correta",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
        name: "UnauthorizedError",
        status_code: 401,
      });
    });

    test("With correct `email` but incorrect `password`", async () => {
      await createUser({
        email: "correct@email.com",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "correct@email.com",
          password: "senha-incorreta",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
        name: "UnauthorizedError",
        status_code: 401,
      });
    });

    test("With incorrect `email` but incorrect `password`", async () => {
      await createUser({});

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "incorrect@email.com",
          password: "senha-incorreta",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
        name: "UnauthorizedError",
        status_code: 401,
      });
    });

    test("With correct `email` and correct `password`", async () => {
      const createdUser = await createUser({
        email: "correct2@email.com",
        password: "correctPassword",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "correct2@email.com",
          password: "correctPassword",
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        token: responseBody.token,
        user_id: createdUser.id,
        expires_at: responseBody.expires_at,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.user_id)).toBe(4);

      expect(Date.parse(responseBody.expires_at)).not.toBeNaN();
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const expiresAt = new Date(responseBody.expires_at);
      const createdAt = new Date(responseBody.created_at);

      expiresAt.setMilliseconds(0);
      createdAt.setMilliseconds(0);
      expect(expiresAt - createdAt).toEqual(
        session.EXPIRATION_TIME_IN_MILISSECONDS,
      );
    });
  });
});
