import crypto from "node:crypto";
import database from "infra/database";

const EXPIRATION_TIME_IN_MILISSECONDS = 1000 * 60 * 60 * 24 * 30; // 30 days

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

const session = {
  create,
  EXPIRATION_TIME_IN_MILISSECONDS,
};

export default session;
