import { createRouter } from "next-connect";
import controller from "infra/controller";
import authentication from "models/authentication";
import session from "models/session";

const router = createRouter();

router.get(getHandler).post(postHandler);
export default router.handler(controller);

async function getHandler(request, response) {
  return response.status(200).end();
}

async function postHandler(request, response) {
  const userInputValues = request.body;

  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );

  const newSession = await session.create(authenticatedUser.id);
  return response.status(201).json(newSession);
}
