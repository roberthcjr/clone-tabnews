export class InternalServerError extends Error {
  constructor({ cause }, statusCode) {
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
export class ServiceError extends InternalServerError {
  constructor({ cause }) {
    super({ cause }, 503);
    this.name = "ServiceError";
    this.message = "Erro em algum serviço";
  }
}
