import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user.js";

const router = createRouter();

router.get(getHandler).post(postHandler);
export default router.handler(controller);

async function getHandler(request, response) {
  return response.status(200).end();
}

async function postHandler(request, response) {
  const userInputValues = request.body;
  const createdUser = await user.create(userInputValues);

  return response.status(201).json(createdUser);
}
