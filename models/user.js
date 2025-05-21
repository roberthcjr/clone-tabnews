import database from "infra/database.js";

async function create({ username, email, password }) {
  const result = await database.query({
    text: `INSERT INTO 
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

const user = {
  create,
};

export default user;
