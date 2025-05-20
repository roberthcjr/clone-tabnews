import { createRouter } from "next-connect";
import controller from "infra/controller";
import { listPendingMigrations, runPendingMigrations } from "models/migrator";

const router = createRouter();

router.get(getHandler).post(postHandler);
export default router.handler(controller);

async function getHandler(request, response) {
  const pendingMigrations = await listPendingMigrations();
  return response.status(200).json(pendingMigrations);
}

async function postHandler(request, response) {
  const runnedMigrations = await runPendingMigrations();

  if (runnedMigrations.length > 0)
    return response.status(201).json(runnedMigrations);

  return response.status(200).json(runnedMigrations);
}
