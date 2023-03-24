import { BaseError } from "./BaseError.js";
import { HttpStatusCode } from "./HttpStatusCode.js";

export class BadRequestError extends BaseError {
  constructor(description = "Bad request") {
    super(HttpStatusCode.BAD_REQUEST, description, true);
  }
}
