export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, code: string, statusCode: number = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}
