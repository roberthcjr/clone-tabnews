import crypto from "node:crypto";
import database from "infra/database";
import { UnauthorizedError } from "infra/errors";
import { text } from "node:stream/consumers";

const EXPIRATION_TIME_IN_MILISSECONDS = 1000 * 60 * 60 * 24 * 30; // 30 days

async function findOneValidByToken(sessionToken) {
  const sessionFind = await runSelectQuery(sessionToken);

  return sessionFind;
  async function runSelectQuery(sessionToken) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          sessions
        WHERE
          token = $1
          AND expires_at > NOW()
        LIMIT
          1
        ;
      `,
      values: [sessionToken],
    });
    if (results.rowCount === 0) {
      throw new UnauthorizedError("Usuário não possui sessão ativa.", {
        action: "Verifique se este usuário está logado e tente novamente.",
      });
    }

    return results.rows[0];
  }
}

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRATION_TIME_IN_MILISSECONDS);
  const session = await runInsertQuery(token, userId, expiresAt);

  return session;

  async function runInsertQuery(token, userId, expiresAt) {
    const results = await database.query({
      text: `
      INSERT INTO
        sessions (token, user_id, expires_at)
      VALUES
        ($1, $2, $3)
      RETURNING
        *
      ;
      `,
      values: [token, userId, expiresAt],
    });

    return results.rows[0];
  }
}

async function renew(sessionId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_TIME_IN_MILISSECONDS);

  const renewedSessionObject = runUpdateQuery(sessionId, expiresAt);
  return renewedSessionObject;

  async function runUpdateQuery(sessionId, expiresAt) {
    const results = await database.query({
      text: `
        UPDATE
          sessions
        SET
          expires_at = $2,
          updated_at = NOW()
        WHERE
          id = $1
        RETURNING
          *
        ;
    `,
      values: [sessionId, expiresAt],
    });
    return results.rows[0];
  }
}

const session = {
  create,
  findOneValidByToken,
  renew,
  EXPIRATION_TIME_IN_MILISSECONDS,
};

export default session;
