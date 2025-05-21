import database from "infra/database.js";
import { ValidationError } from "infra/errors.js";

async function create({ username, email, password }) {
  await validateUniqueEmail(email);
  await validateUniqueUsername(username);

  const newUser = await runInsertQuery({ username, email, password });
  return newUser;

  async function validateUniqueUsername(username) {
    const result = await database.query({
      text: `
      SELECT
        username
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
      ;`,
      values: [username],
    });

    if (result.rowCount > 0) {
      throw new ValidationError(
        "O username informado já está sendo utilizado",
        {
          action: "Informe algum outro username",
          statusCode: 409,
        },
      );
    }
  }

  async function validateUniqueEmail(email) {
    const result = await database.query({
      text: `
      SELECT
        email, username
      FROM
        users
      WHERE
        LOWER(email) = LOWER($1)
      ;`,
      values: [email],
    });

    if (result.rowCount > 0) {
      throw new ValidationError("O email informado já está sendo utilizado", {
        action: "Informe algum outro email",
        statusCode: 409,
      });
    }
  }

  async function runInsertQuery({ username, email, password }) {
    const result = await database.query({
      text: `
      INSERT INTO 
        users (username, email, password)
      VALUES
        ($1, $2, $3)
      RETURNING
        *
      ;`,
      values: [username, email, password],
    });

    return result.rows[0];
  }
}

const user = {
  create,
};

export default user;
