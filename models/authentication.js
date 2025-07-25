import { NotFoundError, UnauthorizedError } from "infra/errors";
import user from "./user";
import password from "./password";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const storedUser = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, storedUser.password);

    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError)
      throw new UnauthorizedError("Dados de autenticação não conferem.", {
        action: "Verifique se os dados enviados estão corretos.",
      });

    throw error;
  }
  async function findUserByEmail(email) {
    let storedUser;
    try {
      storedUser = await user.findOneByEmail(email);
    } catch (error) {
      if (error instanceof NotFoundError)
        throw new UnauthorizedError("Email não confere.", {
          action: "Verifique se este dado está correto.",
        });

      throw error;
    }
    return storedUser;
  }

  async function validatePassword(providedPassword, storedPassword) {
    const correctPasswordMatch = await password.compare(
      providedPassword,
      storedPassword,
    );
    if (!correctPasswordMatch) {
      throw new UnauthorizedError("Senha não confere.", {
        action: "Verifique se este dado está correto.",
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
