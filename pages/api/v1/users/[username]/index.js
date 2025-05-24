import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";

const router = createRouter();

router.get(getHandler).post(postHandler).patch(patchHandler);
export default router.handler(controller);

async function getHandler(request, response) {
  const { username } = request.query;
  const userFound = await user.findOneByUsername(username);
  return response.status(200).json(userFound);
}

async function postHandler(request, response) {
  return response.status(201).json({});
}

async function patchHandler(request, response) {
  const { username } = request.query;
  const userInputValues = request.body;

  const userUpdated = await user.update(username, userInputValues);
  return response.status(200).json(userUpdated);
}
