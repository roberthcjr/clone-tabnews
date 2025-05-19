import { InternalServerError, MethodNotAllowedError } from "infra/errors.js";

export function onNoMatchHandler(request, response) {
  const publicError = new MethodNotAllowedError();
  return response.status(publicError.statusCode).json(publicError);
}

export function onErrorHandler(error, request, response) {
  let publicError = new InternalServerError({
    cause: error,
    statusCode: error.statusCode,
  });

  console.error(publicError);

  return response.status(publicError.statusCode).json(publicError);
}

const controller = {
  onError: onErrorHandler,
  onNoMatch: onNoMatchHandler,
};

export default controller;
