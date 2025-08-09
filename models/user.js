import database from "infra/database.js";
import password from "models/password.js";
import { ValidationError, NotFoundError } from "infra/errors.js";

async function create({ username, email, password: inputPassword }) {
  await validateUniqueUsername(username);
  await validateUniqueEmail(email);
  const hashedPassword = await hashPassword(inputPassword);

  const newUser = await runInsertQuery({
    username,
    email,
    password: hashedPassword,
  });
  return newUser;

  async function runInsertQuery({ username, email, password: inputPassword }) {
    const result = await database.query({
      text: `
      INSERT INTO 
        users (username, email, password)
        VALUES
        ($1, $2, $3)
        RETURNING
        *
        ;`,
      values: [username, email, inputPassword],
    });

    return result.rows[0];
  }
}

async function findOneByUsername(username) {
  const userFound = await getUserByUsername(username);

  return userFound;

  async function getUserByUsername(username) {
    const result = await database.query({
      text: `
      SELECT
        *
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
      LIMIT
        1
      ;`,
      values: [username],
    });

    if (result.rowCount === 0) {
      throw new NotFoundError(
        "O username informado não foi encontrado no sistema",
        {
          action: "Verifique se o username está digitado corretamente",
        },
      );
    }

    return result.rows[0];
  }
}

async function findOneByEmail(email) {
  const userFound = await getUserByEmail(email);

  return userFound;

  async function getUserByEmail(email) {
    const result = await database.query({
      text: `
      SELECT
        *
      FROM
        users
      WHERE
        LOWER(email) = LOWER($1)
      LIMIT
        1
      ;`,
      values: [email],
    });

    if (result.rowCount === 0) {
      throw new NotFoundError(
        "O email informado não foi encontrado no sistema",
        {
          action: "Verifique se o email está digitado corretamente",
        },
      );
    }

    return result.rows[0];
  }
}

async function update(username, userInput) {
  const currentUser = await findOneByUsername(username);
  if ("username" in userInput) {
    await validateUniqueUsername(userInput.username);
  }
  if ("email" in userInput) {
    await validateUniqueEmail(userInput.email);
  }
  if ("password" in userInput) {
    userInput.password = await hashPassword(userInput.password);
  }
  const userWithUpdatedValues = { ...currentUser, ...userInput };

  const updatedUser = await runUpdateQuery(userWithUpdatedValues);
  return updatedUser;

  async function runUpdateQuery(userWithUpdatedValues) {
    const result = await database.query({
      text: `
      UPDATE
        users
      SET
        username = $2,
        email = $3,
        password = $4,
        updated_at = timezone('utc', now())
      WHERE
        id=$1
      RETURNING
        *
        ;`,
      values: [
        userWithUpdatedValues.id,
        userWithUpdatedValues.username,
        userWithUpdatedValues.email,
        userWithUpdatedValues.password,
      ],
    });

    return result.rows[0];
  }
}

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
    throw new ValidationError("O username informado já está sendo utilizado", {
      action: "Informe algum outro username",
      statusCode: 409,
    });
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

async function hashPassword(inputPassword) {
  const hashedPassword = await password.hash(inputPassword);
  return hashedPassword;
}

const user = {
  create,
  findOneByEmail,
  findOneByUsername,
  update,
};

export default user;
