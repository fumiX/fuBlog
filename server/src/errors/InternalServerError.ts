import { BaseError } from "./BaseError.js";
import { HttpStatusCode } from "./HttpStatusCode.js";

export class InternalServerError extends BaseError {
  constructor(isOperational = true, description = "Internal server error") {
    super(HttpStatusCode.INTERNAL_SERVER, description, isOperational);
  }
}
