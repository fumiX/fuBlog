import { BaseError } from "./BaseError.js";
import { HttpStatusCode } from "./HttpStatusCode.js";

export class NotFoundError extends BaseError {
  constructor(description = "Not found") {
    super(HttpStatusCode.NOT_FOUND, description, true);
  }
}
