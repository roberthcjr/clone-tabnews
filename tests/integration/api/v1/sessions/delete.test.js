import { version as uuidVersion } from "uuid";
import setCookieParser from "set-cookie-parser";
import session from "models/session";
import {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
  createSession
} from "tests/orchestrator";

beforeAll(async () => {
  await waitForAllServices();
  await clearDatabase();
  await runPendingMigrations();
});
describe("DELETE to api/v1/sessions", () => {
  describe("Default user", () => {
    test("With nonexistent user", async () => {
      const nonExistentToken = "f1d29af767396c3eb6227cbb7bfcd0a41ce58fad96d5c9a6a1b79e781a8a5f3edb7c5382d8c436ff158c0c01f1b2ef61";

      const response = await fetch("http://localhost:3000/api/v1/sessions/", {
        method: "DELETE",
        headers: {
          cookie: `session_id=${nonExistentToken}`
        }
      });

      expect(response.status).toBe(401);
    });

    test("With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_TIME_IN_MILISSECONDS),
      });

      const userWithExpiredSession = "userWithExpiredSession";
      const createdUser = await createUser({
        username: userWithExpiredSession,
      });

      const sessionObject = await createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch(`http://localhost:3000/api/v1/sessions`, {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(401);

    });

    test("With valid session", async () => {
      const userWithValidSession = "userWithValidSession";
      const createdUser = await createUser({
        username: userWithValidSession,
      });

      const sessionObject = await createSession(createdUser.id);

      const response = await fetch(`http://localhost:3000/api/v1/sessions`, {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: sessionObject.id,
        token: sessionObject.token,
        user_id: sessionObject.user_id,
        expires_at: responseBody.expires_at,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at
      })

      expect(uuidVersion(responseBody.id)).toBe(4);

      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(
        sessionObject.expires_at.toISOString() > responseBody.expires_at,
      ).toBeTruthy();
      expect(
        responseBody.updated_at > sessionObject.updated_at.toISOString(),
      ).toBeTruthy();

      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        maxAge: -1,
        path: "/",
        httpOnly: true
      })
    });


  });
});