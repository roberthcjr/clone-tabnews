export class InternalServerError extends Error {
  constructor({ cause, statusCode }) {
    super("Um erro interno inesperado aconteceu", { cause });
    this.name = "InternalServerError";
    this.action = "Entre em contato com o suporte";
    this.statusCode = statusCode ?? 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class MethodNotAllowedError extends Error {
  constructor() {
    super("Método não permitido para esse endpoint");
    this.name = "MethodNotAllowedError";
    this.action =
      "Verifique que o método HTTP enviado é válido para esse endpoint";
    this.statusCode = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ServiceError extends Error {
  constructor(message, { cause }) {
    super(message ?? "Erro em algum serviço", { cause });
    this.name = "ServiceError";
    this.action = "Verifique se o serviço está disponível";
    this.statusCode = 503;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ValidationError extends Error {
  constructor(message, { cause, action, statusCode }) {
    super(message ?? "Ocorreu algum erro em uma validação", { cause });
    this.name = "ValidationError";
    this.action = action ?? "Verifique se os dados enviados";
    this.statusCode = statusCode ?? 400;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class NotFoundError extends Error {
  constructor(message, { cause, action, statusCode }) {
    super(message ?? "Não foi possível encontrar este recurso no sistema", {
      cause,
    });
    this.name = "NotFoundError";
    this.action =
      action ??
      "Verifique se os parâmetros enviados na consulta estão corretos";
    this.statusCode = statusCode ?? 404;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class UnauthorizedError extends Error {
  constructor(message, { cause, action, statusCode }) {
    super(message ?? "Usuário não autenticado", {
      cause,
    });
    this.name = "UnauthorizedError";
    this.action = action ?? "Faça novamente o login para continuar";
    this.statusCode = statusCode ?? 401;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
