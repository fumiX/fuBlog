// TODO extend this

import { HttpStatusCode } from "./HttpStatusCode.js";

export class BaseError extends Error {
  public readonly httpCode: HttpStatusCode;
  public readonly isOperational: boolean;

  constructor(httpCode: HttpStatusCode, description: string, isOperational: boolean) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);

    this.httpCode = httpCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this);
  }

  toString(): string {
    return [this.httpCode, super.toString()].join(" ");
  }
}
