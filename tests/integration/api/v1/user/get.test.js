import { version as uuidVersion } from "uuid";
import setCookieParser from "set-cookie-parser";

import {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
  createSession,
} from "tests/orchestrator";
import session from "models/session";

beforeAll(async () => {
  await waitForAllServices();
  await clearDatabase();
  await runPendingMigrations();
});

describe("GET to api/v1/user", () => {
  describe("Default user", () => {
    test("With valid session", async () => {
      const userWithValidSession = "userWithValidSession";
      const createdUser = await createUser({
        username: userWithValidSession,
      });

      const sessionObject = await createSession(createdUser.id);

      const response = await fetch(`http://localhost:3000/api/v1/user`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const cacheControl = response.headers.get("Cache-Control");
      expect(cacheControl).toBe(
        "no-store, no-cache, max-age=0, must-revalidate",
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: createdUser.id,
        username: userWithValidSession,
        email: createdUser.email,
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toBe(4);

      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      // Session renewed tests
      const renewedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );

      expect(
        renewedSessionObject.expires_at > sessionObject.expires_at,
      ).toBeTruthy();
      expect(
        renewedSessionObject.updated_at > sessionObject.updated_at,
      ).toBeTruthy();

      // Cookie set tests
      const parserSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parserSetCookie.session_id).toEqual({
        name: "session_id",
        value: renewedSessionObject.token,
        maxAge: session.EXPIRATION_TIME_IN_MILISSECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });

    test("With valid session about to expire", async () => {
      const userWithSessionAboutToExpire = "userWithSessionAboutToExpire";
      const createdUser = await createUser({
        username: userWithSessionAboutToExpire,
      });

      jest.useFakeTimers({
        now: new Date(Date.now() - 1000 * 60 * 60 * 24 * 29),
      });
      const sessionObject = await createSession(createdUser.id);

      jest.useRealTimers();
      const response = await fetch(`http://localhost:3000/api/v1/user`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: createdUser.id,
        username: userWithSessionAboutToExpire,
        email: createdUser.email,
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toBe(4);

      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      // Session renewed tests
      const renewedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );

      expect(
        renewedSessionObject.expires_at > sessionObject.expires_at,
      ).toBeTruthy();
      expect(
        renewedSessionObject.updated_at > sessionObject.updated_at,
      ).toBeTruthy();

      // Cookie set tests
      const parserSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parserSetCookie.session_id).toEqual({
        name: "session_id",
        value: renewedSessionObject.token,
        maxAge: session.EXPIRATION_TIME_IN_MILISSECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });

    test("With nonexistent session", async () => {
      const nonExistentToken =
        "a5580d5b2dc2d1145e1713117c1c29e6412b4e886d0ca57d213d2ba4876e9edc7409b98952985acf183b723990626220";

      const response = await fetch(`http://localhost:3000/api/v1/user`, {
        headers: {
          Cookie: `session_id=${nonExistentToken}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
        name: "UnauthorizedError",
        status_code: 401,
      });
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

      const response = await fetch(`http://localhost:3000/api/v1/user`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
        name: "UnauthorizedError",
        status_code: 401,
      });
    });
  });
});
