import * as cookie from "cookie";
import session from "models/session";
import {
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "infra/errors.js";

export function onNoMatchHandler(request, response) {
  const publicError = new MethodNotAllowedError();
  return response.status(publicError.statusCode).json(publicError);
}

export function onErrorHandler(error, request, response) {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof UnauthorizedError
  ) {
    return response.status(error.statusCode).json(error);
  }

  const publicError = new InternalServerError({
    cause: error,
  });

  console.error(publicError);

  return response.status(publicError.statusCode).json(publicError);
}

async function setSessionCookie(sessionToken, response) {
  const setCookie = cookie.serialize("session_id", sessionToken, {
    path: "/",
    maxAge: session.EXPIRATION_TIME_IN_MILISSECONDS / 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  response.setHeader("Set-Cookie", setCookie);
}

const controller = {
  onError: onErrorHandler,
  onNoMatch: onNoMatchHandler,
  setSessionCookie,
};

export default controller;
