import { BaseError } from "./BaseError.js";
import { HttpStatusCode } from "./HttpStatusCode.js";

export class ForbiddenError extends BaseError {
  constructor(description = "Forbidden") {
    super(HttpStatusCode.FORBIDDEN, description, true);
  }
}
